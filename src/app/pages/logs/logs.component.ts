import { Component, OnInit, AfterViewInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Firestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';

declare var google: any;

@Component({
  selector: 'app-logs',
  standalone: true,
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit, AfterViewInit {
  constructor(private firestore: Firestore) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.cargarGraficos();
  }

  async cargarGraficos() {
    const logIngresos = await this.obtenerLogIngresos();
    const turnosPorDia = await this.obtenerTurnosPorDia();
    const turnosPorEspecialista = await this.obtenerTurnosPorEspecialista();
    const turnosPorEspecialidad = await this.obtenerTurnosPorEspecialidad();
    const turnosFinalizados =
      await this.obtenerTurnosFinalizadosPorEspecialista();

    google.charts.load('current', {
      packages: ['corechart', 'bar'],
    });

    google.charts.setOnLoadCallback(() => {
      this.dibujarGraficoDeArea(turnosPorDia);
      this.dibujarGraficoDeTorta(turnosPorEspecialidad);
      this.dibujarGraficoDeBarrasEspecialistas(turnosPorEspecialista);
      this.dibujarGraficoDeLineas(turnosFinalizados);
      this.dibujarGraficoDeIngresos(logIngresos);
    });
  }

  async obtenerLogIngresos() {
    const logRef = collection(this.firestore, 'logIngresos');
    const snapshot = await getDocs(logRef);

    return snapshot.docs.map((doc) => ({
      usuario: doc.data()['usuario'],
      fecha: new Date(doc.data()['fecha']),
    }));
  }

  async obtenerTurnosPorDia() {
    const turnosRef = collection(this.firestore, 'turnosPorDia');
    const q = query(turnosRef, orderBy('cantidad', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      fecha: doc.id,
      cantidad: doc.data()['cantidad'],
    }));
  }

  async obtenerTurnosPorEspecialista() {
    const turnosRef = collection(this.firestore, 'turnosPorEspecialista');
    const q = query(turnosRef, orderBy('cantidad', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      nombre: doc.data()['nombre'],
      apellido: doc.data()['apellido'],
      cantidad: doc.data()['cantidad'],
    }));
  }

  async obtenerTurnosPorEspecialidad() {
    const turnosRef = collection(this.firestore, 'turnosPorEspecialidad');
    const q = query(turnosRef, orderBy('cantidad', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      especialidad: doc.data()['especialidad'],
      cantidad: doc.data()['cantidad'],
    }));
  }

  async obtenerTurnosFinalizadosPorEspecialista() {
    const turnosRef = collection(
      this.firestore,
      'turnosFinalizadosPorEspecialista'
    );
    const q = query(turnosRef, orderBy('cantidad', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      especialista: doc.data()['especialista'],
      cantidad: doc.data()['cantidad'],
    }));
  }

  dibujarGraficoDeIngresos(data: any[]) {
    const ingresosPorDia = data.reduce((acc, log) => {
      const fecha = log.fecha.toISOString().split('T')[0];
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    const chartData = google.visualization.arrayToDataTable([
      ['Fecha', 'Ingresos'],
      ...Object.entries(ingresosPorDia),
    ]);

    const options = {
      title: 'Ingresos al Sistema por Día',
      hAxis: { title: 'Fecha' },
      vAxis: { title: 'Cantidad de Ingresos' },
      legend: { position: 'bottom' },
    };

    const chart = new google.visualization.Histogram(
      document.getElementById('grafico-ingresos')
    );
    chart.draw(chartData, options);
  }

  dibujarGraficoDeArea(data: any[]) {
    const chartData = google.visualization.arrayToDataTable([
      ['Fecha', 'Cantidad de Turnos'],
      ...data.map((item) => [item.fecha, item.cantidad]),
    ]);

    const options = {
      title: 'Cantidad de Turnos por Día',
      hAxis: { title: 'Fecha' },
      vAxis: { title: 'Cantidad de Turnos' },
      legend: { position: 'bottom' },
      areaOpacity: 0.3,
    };

    const chart = new google.visualization.AreaChart(
      document.getElementById('grafico-area')
    );
    chart.draw(chartData, options);
  }

  dibujarGraficoDeTorta(data: any[]) {
    const chartData = google.visualization.arrayToDataTable([
      ['Especialidad', 'Cantidad de Turnos'],
      ...data.map((item) => [item.especialidad, item.cantidad]),
    ]);

    const options = {
      title: 'Distribución de Turnos por Especialidad',
      is3D: true,
    };

    const chart = new google.visualization.PieChart(
      document.getElementById('grafico-torta')
    );
    chart.draw(chartData, options);
  }

  dibujarGraficoDeBarrasEspecialistas(data: any[]) {
    const chartData = google.visualization.arrayToDataTable([
      ['Nombre Completo', 'Cantidad de Turnos'],
      ...data.map((item) => [`${item.nombre} ${item.apellido}`, item.cantidad]),
    ]);

    const options = {
      title: 'Turnos por Especialista',
      chartArea: { width: '50%' },
      hAxis: { title: 'Cantidad de Turnos', minValue: 0 },
      vAxis: { title: 'Especialista' },
    };

    const chart = new google.visualization.BarChart(
      document.getElementById('grafico-barras-especialistas')
    );
    chart.draw(chartData, options);
  }

  dibujarGraficoDeLineas(data: any[]) {
    const chartData = google.visualization.arrayToDataTable([
      ['Especialista', 'Cantidad de Turnos Finalizados'],
      ...data.map((item) => [item.especialista, item.cantidad]),
    ]);

    const options = {
      title: 'Turnos Finalizados por Especialista',
      hAxis: { title: 'Especialista' },
      vAxis: { title: 'Cantidad de Turnos Finalizados' },
      legend: { position: 'bottom' },
    };

    const chart = new google.visualization.LineChart(
      document.getElementById('grafico-lineas')
    );
    chart.draw(chartData, options);
  }

  async descargarPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const logo = 'logo.png';
    pdf.addImage(logo, 'PNG', 10, 5, 20, 20);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);

    const titleYPosition = 25;
    pdf.text(
      'Reporte de Estadísticas de Turnos',
      pageWidth / 2,
      titleYPosition,
      {
        align: 'center',
      }
    );

    const currentDate = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Fecha de emisión: ${currentDate}`, pageWidth - 10, 15, {
      align: 'right',
    });

    let y = titleYPosition + 30;
    const chartWidth = pageWidth - 20;
    const chartHeight = chartWidth * 0.4;

    const charts = [
      { id: 'grafico-ingresos', title: 'Ingreso al Sistema por Día' },
      { id: 'grafico-area', title: 'Cantidad de Turnos por Día' },
      { id: 'grafico-torta', title: 'Turnos por Especialidad' },
      { id: 'grafico-barras-especialistas', title: 'Turnos por Especialista' },
      { id: 'grafico-lineas', title: 'Turnos Finalizados por Especialista' },
    ];

    for (const chart of charts) {
      const chartElement = document.getElementById(chart.id);
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 3,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');

        pdf.setFontSize(12);
        pdf.text(chart.title, 10, y - 5);

        pdf.addImage(
          imgData,
          'PNG',
          10,
          y,
          chartWidth,
          chartHeight,
          undefined,
          'FAST'
        );

        y += chartHeight + 20;

        if (y + chartHeight > pageHeight - 20) {
          pdf.addPage();
          y = 30;
        }
      }
    }

    pdf.save('estadisticas_turnos.pdf');
  }
}
