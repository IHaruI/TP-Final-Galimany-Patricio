import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Turno } from '../../interfaces/turno.interface';
import { PerfilComponent } from '../../perfil/perfil.component';
import { Router } from '@angular/router';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, PerfilComponent, ModalComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css'],
})
export class MisTurnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtro = '';
  isModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalInput = false;
  selectedTurno: Turno | null = null;

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService,
    private router: Router
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

  logout() {
    this.authService
      .logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }

  redireccion(dato: string) {
    if (dato == 'solicitar') {
      this.router.navigate(['/solicitar-turnos']);
    } else if (dato == 'historial') {
      this.router.navigate(['/historial-clinica']);
    }
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();

    this.turnosFiltrados = this.turnos.filter((turno) => {
      return (
        (turno.especialidad &&
          turno.especialidad.toLowerCase().includes(filtroLower)) ||
        (turno.especialista &&
          turno.especialista.toLowerCase().includes(filtroLower)) ||
        (turno.estado && turno.estado.toLowerCase().includes(filtroLower)) ||
        (turno.altura &&
          turno.altura.toString().toLowerCase().includes(filtroLower)) ||
        (turno.peso &&
          turno.peso.toString().toLowerCase().includes(filtroLower)) ||
        (turno.temperatura &&
          turno.temperatura.toString().toLowerCase().includes(filtroLower)) ||
        (turno.presion &&
          turno.presion.toString().toLowerCase().includes(filtroLower)) ||
        (turno.datosDinamicos &&
          turno.datosDinamicos.some(
            (dato) =>
              dato.clave.toLowerCase().includes(filtroLower) ||
              dato.valor.toLowerCase().includes(filtroLower)
          ))
      );
    });
  }

  openModal(
    title: string,
    message: string,
    showInput = false,
    turno: Turno | null = null
  ) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalInput = showInput;
    this.selectedTurno = turno;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedTurno = null;
  }

  handleModalConfirm(inputValue: string | null) {
    if (this.selectedTurno) {
      if (this.modalTitle.includes('Cancelar Turno')) {
        this.cancelarTurno(this.selectedTurno, inputValue);
      } else if (this.modalTitle.includes('Completar Encuesta')) {
        this.completarEncuesta(this.selectedTurno, inputValue);
      } else if (this.modalTitle.includes('Calificar Atención')) {
        this.calificarAtencion(this.selectedTurno, inputValue);
      }
    }
    this.closeModal();
  }

  cancelarTurno(turno: Turno, motivo: string | null) {
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
    this.openModal('Reseña del Turno', turno.comentario || 'Sin comentario');
  }

  completarEncuesta(turno: Turno, inputValue: string | null) {
    this.openModal('Completar Encuesta', 'Escribe tu encuesta:', true, turno);
  }

  calificarAtencion(turno: Turno, inputValue: string | null) {
    this.openModal(
      'Calificar Atención',
      'Escribe tu calificación:',
      true,
      turno
    );
  }
}
