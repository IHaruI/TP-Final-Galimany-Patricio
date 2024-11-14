import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { Turno } from '../../interfaces/turno.interface';
import { PerfilComponent } from '../../perfil/perfil.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-especialista-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, PerfilComponent],
  templateUrl: './especialista-turnos.component.html',
  styleUrls: ['./especialista-turnos.component.css'],
})
export class EspecialistaTurnosComponent implements OnInit {
  turnos: Turno[] = [];
  filtroGeneral: string = '';
  turnosFiltrados: Turno[] = [];
  especialistaNombre: string | null = null;
  modalVisible: boolean = false;
  modalTitle: string = '';
  modalComentario: string = '';
  accionEnCurso: string = '';
  turnoSeleccionado: Turno | null = null;
  modalResenaVisible: boolean = false;
  modalResenaComentario: string = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getNombre().then((nombre) => {
      this.especialistaNombre = nombre;
      if (this.especialistaNombre) {
        this.obtenerTurnos();
      }
    });
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
    if (dato == 'historial') {
      this.router.navigate(['/historial-clinica']);
    }
  }

  obtenerTurnos() {
    this.turnosService
      .obtenerTurnosPorEspecialista(this.especialistaNombre!)
      .subscribe((turnos) => {
        this.turnos = turnos.map((turno) => ({
          ...turno,
          paciente: `${turno.nombre} ${turno.apellido}`,
        }));
        this.aplicarFiltro();
      });
  }

  aplicarFiltro() {
    const filtroLower = this.filtroGeneral.toLowerCase();

    this.turnosFiltrados = this.turnos.filter((turno) => {
      return (
        (turno.especialidad &&
          turno.especialidad.toLowerCase().includes(filtroLower)) ||
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
          )) ||
        (turno.paciente && turno.paciente.toLowerCase().includes(filtroLower))
      );
    });
  }

  abrirModal(titulo: string, accion: string, turno: Turno) {
    this.modalTitle = titulo;
    this.accionEnCurso = accion;
    this.turnoSeleccionado = turno;
    this.modalComentario = '';
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.modalComentario = '';
  }

  cerrarModalResena() {
    this.modalResenaVisible = false;
    this.modalResenaComentario = '';
  }

  procesarAccion() {
    if ((this.modalComentario ?? '').trim() === '') {
      alert('Debe ingresar un comentario.');
      return;
    }

    if (this.turnoSeleccionado) {
      const turno = this.turnoSeleccionado;

      if (!turno.id) {
        alert('El turno no tiene un ID válido.');
        return;
      }

      switch (this.accionEnCurso) {
        case 'cancelar':
          this.turnosService
            .actualizarTurno(turno.id, {
              estado: 'Cancelado',
              comentario: this.modalComentario ?? '',
            })
            .subscribe(() => {
              turno.estado = 'Cancelado';
              turno.comentario = this.modalComentario ?? '';
              this.cerrarModal();
            });
          break;

        case 'rechazar':
          this.turnosService
            .actualizarTurno(turno.id, {
              estado: 'Rechazado',
              comentario: this.modalComentario ?? '',
            })
            .subscribe(() => {
              turno.estado = 'Rechazado';
              turno.comentario = this.modalComentario ?? '';
              this.cerrarModal();
            });
          break;

        // case 'aceptar':
        //   this.turnosService
        //     .actualizarTurno(turno.id, { estado: 'Aceptado' })
        //     .subscribe(() => {
        //       turno.estado = 'Aceptado';
        //     });
        //   break;

        case 'finalizar':
          this.turnosService
            .actualizarTurno(turno.id, {
              estado: 'Realizado',
              comentario: this.modalComentario ?? '',
            })
            .subscribe(() => {
              turno.estado = 'Realizado';
              turno.comentario = this.modalComentario ?? '';

              const pacienteId = turno.pacienteId ?? 'valor-default';

              this.router.navigate(['/historia-clinica'], {
                queryParams: { pacienteId: pacienteId },
              });

              this.cerrarModal();
            });
          break;

        default:
          this.cerrarModal();
          break;
      }
    }
  }

  aceptarTurnoDirecto(turno: Turno) {
    if (!turno.id) {
      alert('El turno no tiene un ID válido.');
      return;
    }

    this.turnosService
      .actualizarTurno(turno.id, { estado: 'Aceptado' })
      .subscribe(() => {
        turno.estado = 'Aceptado';
      });
  }

  verResena(turno: Turno) {
    this.modalResenaComentario =
      turno.comentario ?? 'No hay comentario disponible';
    this.modalResenaVisible = true;
  }
}
