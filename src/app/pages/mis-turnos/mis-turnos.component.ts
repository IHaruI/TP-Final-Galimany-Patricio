import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Turno } from '../../interfaces/turno.interface';
import { SolicitarTurnoComponent } from '../solicitar-turnos/solicitar-turnos.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, SolicitarTurnoComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css'],
})
export class MisTurnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad = '';
  filtroEspecialista = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const pacienteId = this.authService.getUid();
    if (pacienteId) {
      this.turnosService
        .obtenerTurnosPaciente(pacienteId)
        .subscribe((turnos) => {
          this.turnos = turnos;
          this.turnosFiltrados = [...this.turnos];
        });
    } else {
      console.warn('Usuario no autenticado');
    }
  }

  aplicarFiltro() {
    this.turnosFiltrados = this.turnos.filter(
      (turno) =>
        turno.especialidad
          .toLowerCase()
          .includes(this.filtroEspecialidad.toLowerCase()) &&
        turno.especialista
          .toLowerCase()
          .includes(this.filtroEspecialista.toLowerCase())
    );
  }

  cancelarTurno(turno: Turno) {
    const motivo = prompt('¿Por qué deseas cancelar el turno?');
    if (motivo) {
      this.turnosService
        .actualizarTurno(turno.id!, { estado: 'Cancelado', comentario: motivo })
        .subscribe(() => {
          turno.estado = 'Cancelado';
          turno.comentario = motivo;
        });
    }
  }

  verResena(turno: Turno) {
    alert(`Reseña del turno:\n${turno.comentario}`);
  }

  completarEncuesta(turno: Turno) {
    const encuesta = prompt('Completa la encuesta para el turno realizado:');
    if (encuesta) {
      this.turnosService
        .actualizarTurno(turno.id!, { comentario: encuesta })
        .subscribe(() => {
          turno.comentario = encuesta;
        });
    }
  }

  calificarAtencion(turno: Turno) {
    const calificacion = prompt('Califica la atención del especialista:');
    if (calificacion) {
      this.turnosService
        .actualizarTurno(turno.id!, { comentario: calificacion })
        .subscribe(() => {
          turno.comentario = calificacion;
        });
    }
  }
}
