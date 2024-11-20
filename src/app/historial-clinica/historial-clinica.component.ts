import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { TurnosService } from '../services/turnos.service';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';

interface DatoDinamico {
  clave: string;
  valor: string;
}

interface Historial {
  especialistaNombre?: string;
  especialistaApellido?: string;
  pacienteNombre?: string;
  pacienteApellido?: string;
  fechaConHora: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: string;
  datosDinamicos: DatoDinamico[];
}

@Component({
  selector: 'app-historial-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-clinica.component.html',
  styleUrls: ['./historial-clinica.component.css'],
})
export class HistorialClinicaComponent implements OnInit {
  isEspecialista: boolean = false;
  isPaciente: boolean = false;
  isAdministrador: boolean = false;
  pacienteId: string = '';
  especialistaId: string | null = '';
  historialClinicoEspecialista: Historial[] = [];
  historialClinicoPaciente: Historial[] = [];
  historialClinicoAdministrador: Historial[] = [];

  especialistas: string[] = [];
  especialistaSeleccionado: string = '';

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService
  ) {}

  ngOnInit() {
    this.authService.getRol().then((rol) => {
      if (rol === 'especialista') {
        this.especialistaId = this.authService.getUid() || '';
        this.isEspecialista = true;
        this.cargarHistorialClinicoEspecialista();
      } else if (rol === 'paciente') {
        this.pacienteId = this.authService.getUid() || '';
        this.isPaciente = true;
        this.cargarHistorialClinicoPaciente();
      } else if (rol === 'administrador') {
        this.isAdministrador = true;
        this.cargarHistorialCompletoClinicoPaciente();
      }
    });
  }

  cargarHistorialClinicoEspecialista() {
    if (this.especialistaId) {
      this.turnosService
        .obtenerHistorialClinicoPorEspecialista(this.especialistaId)
        .subscribe((historial: Historial[]) => {
          this.historialClinicoEspecialista = historial;
        });
    }
  }

  cargarHistorialClinicoPaciente() {
    if (this.pacienteId) {
      this.turnosService
        .obtenerHistorialClinicoPorPaciente(this.pacienteId)
        .subscribe((historial: Historial[]) => {
          this.historialClinicoPaciente = historial;

          const especialistasSet = new Set(
            historial.map(
              (h) => `${h.especialistaNombre} ${h.especialistaApellido}`
            )
          );
          this.especialistas = Array.from(especialistasSet);
        });
    }
  }

  cargarHistorialCompletoClinicoPaciente() {
    this.turnosService
      .obtenerHistorialCompleto()
      .subscribe((historial: Historial[]) => {
        this.historialClinicoAdministrador = historial;
      });
  }

  descargarPDFPorEspecialista() {
    if (!this.especialistaSeleccionado) return;

    const doc = new jsPDF();

    const logo = 'logo.png';
    doc.addImage(logo, 'PNG', 10, 2, 20, 20);

    doc.setFontSize(16);
    doc.text(`Historia Clínica del Especialista`, 105, 20, { align: 'center' });

    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${currentDate}`, 200, 14, { align: 'right' });

    let yOffset = 30;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 255);

    const historialFiltrado = this.historialClinicoPaciente.filter(
      (historial) =>
        `${historial.especialistaNombre} ${historial.especialistaApellido}` ===
        this.especialistaSeleccionado
    );

    historialFiltrado.forEach((historial, index) => {
      doc.setDrawColor(0);
      doc.line(10, yOffset - 5, 200, yOffset - 5);

      doc.text(`Historial #${index + 1}`, 10, yOffset);
      yOffset += 10;

      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(
        `Especialista: ${historial.especialistaNombre} ${historial.especialistaApellido}`,
        15,
        yOffset
      );
      doc.text(`Fecha y Hora: ${historial.fechaConHora}`, 15, yOffset + 10);
      doc.text(`Altura: ${historial.altura} cm`, 15, yOffset + 20);
      doc.text(`Peso: ${historial.peso} kg`, 15, yOffset + 30);
      doc.text(`Temperatura: ${historial.temperatura} °C`, 15, yOffset + 40);
      doc.text(`Presión: ${historial.presion}`, 15, yOffset + 50);

      yOffset += 60;

      if (historial.datosDinamicos && historial.datosDinamicos.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 0);
        doc.text('Datos Adicionales:', 15, yOffset);
        yOffset += 10;

        historial.datosDinamicos.forEach((dato: DatoDinamico) => {
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.text(`- ${dato.clave}: ${dato.valor}`, 20, yOffset);
          yOffset += 8;
        });
      }

      yOffset += 15;

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.save(`historia_clinica_${this.especialistaSeleccionado}.pdf`);
  }

  descargarPDF() {
    const doc = new jsPDF();

    const logo = 'logo.png';
    doc.addImage(logo, 'PNG', 10, 2, 20, 20);

    doc.setFontSize(16);
    doc.text('Historia Clínica del Paciente', 105, 20, { align: 'center' });

    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${currentDate}`, 200, 14, { align: 'right' });

    let yOffset = 30;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 255);

    this.historialClinicoPaciente.forEach((historial, index) => {
      doc.setDrawColor(0);
      doc.line(10, yOffset - 5, 200, yOffset - 5);

      doc.text(`Historial #${index + 1}`, 10, yOffset);
      yOffset += 10;

      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(
        `Especialista: ${historial.especialistaNombre} ${historial.especialistaApellido}`,
        15,
        yOffset
      );
      doc.text(`Fecha y Hora: ${historial.fechaConHora}`, 15, yOffset + 10);
      doc.text(`Altura: ${historial.altura} cm`, 15, yOffset + 20);
      doc.text(`Peso: ${historial.peso} kg`, 15, yOffset + 30);
      doc.text(`Temperatura: ${historial.temperatura} °C`, 15, yOffset + 40);
      doc.text(`Presión: ${historial.presion}`, 15, yOffset + 50);

      yOffset += 60;

      if (historial.datosDinamicos && historial.datosDinamicos.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 0);
        doc.text('Datos Adicionales:', 15, yOffset);
        yOffset += 10;

        historial.datosDinamicos.forEach((dato: DatoDinamico) => {
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.text(`- ${dato.clave}: ${dato.valor}`, 20, yOffset);
          yOffset += 8;
        });
      }

      yOffset += 15;

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.save('historia_clinica.pdf');
  }
}
