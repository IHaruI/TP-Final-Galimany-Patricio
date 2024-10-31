import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-turnos.component.html',
  styleUrls: ['./solicitar-turnos.component.css'],
})
export class SolicitarTurnoComponent implements OnInit {
  especialidades: string[] = [];
  especialistas: any[] = [];
  especialistasFiltrados: any[] = [];
  fechasDisponibles: Date[] = [];

  especialidadSeleccionada: string = '';
  especialistaSeleccionado: any | null = null;
  fechaSeleccionada: Date | null = null;
  pacienteId: string | null = null;
  nombrePaciente: string = '';
  apellidoPaciente: string = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.pacienteId = this.authService.getUid();

    // Obtener el nombre y apellido del paciente
    if (this.pacienteId) {
      const data = await this.authService.getPacienteData();
      if (data) {
        this.nombrePaciente = data.nombre;
        this.apellidoPaciente = data.apellido;
        console.log('nombre: ' + this.nombrePaciente);
      }
    } else {
      console.log('El paciente no está autenticado.');
    }

    this.obtenerEspecialidades(); // Llama a esta función para obtener las especialidades
  }

  obtenerEspecialidades() {
    this.turnosService.obtenerEspecialidades().subscribe((especialidades) => {
      this.especialidades = especialidades;
    });
  }

  filtrarEspecialistasPorEspecialidad() {
    if (this.especialidadSeleccionada) {
      this.turnosService
        .obtenerEspecialistasPorEspecialidad(this.especialidadSeleccionada)
        .subscribe((especialistas) => {
          this.especialistas = especialistas;
          this.especialistasFiltrados = [...this.especialistas];
          this.fechaSeleccionada = null;
          this.fechasDisponibles = [];
          this.especialistaSeleccionado = null;
        });
    } else {
      this.especialistasFiltrados = [];
      this.fechaSeleccionada = null;
      this.fechasDisponibles = [];
      this.especialistaSeleccionado = null;
    }
  }

  seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;

    this.turnosService
      .obtenerFechasDisponibles(this.especialistaSeleccionado.uid)
      .subscribe((fechas) => {
        this.fechasDisponibles = fechas;
      });
  }

  seleccionarFecha(fecha: Date) {
    this.fechaSeleccionada = fecha;
  }

  solicitarTurno() {
    if (
      this.especialistaSeleccionado &&
      this.fechaSeleccionada &&
      this.pacienteId
    ) {
      this.turnosService
        .solicitarTurno({
          pacienteId: this.pacienteId,
          especialidad: this.especialidadSeleccionada,
          especialista: this.especialistaSeleccionado.nombre,
          fecha: this.fechaSeleccionada,
          estado: 'Pendiente',
          nombre: this.nombrePaciente,
          apellido: this.apellidoPaciente,
        })
        .subscribe(() => {
          alert('Turno solicitado exitosamente.');
        });
    } else {
      alert(
        'Por favor, selecciona un especialista, una fecha y asegúrate de estar autenticado.'
      );
    }
  }
}
