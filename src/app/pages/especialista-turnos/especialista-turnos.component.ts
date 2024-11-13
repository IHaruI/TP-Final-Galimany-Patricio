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
        this.aplicarFiltro(); // Aplica el filtro inicial
      });
  }

  aplicarFiltro() {
    const filtro = this.filtroGeneral.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(
      (turno) =>
        turno.especialidad.toLowerCase().includes(filtro) ||
        (turno.paciente?.toLowerCase().includes(filtro) ?? false)
    );
  }

  cancelarTurno(turno: Turno) {
    if (!turno.id) return;
    const comentario = prompt('Ingrese el motivo de cancelación:');
    if (comentario) {
      this.turnosService
        .actualizarTurno(turno.id, {
          estado: 'Cancelado',
          comentario,
        })
        .subscribe(() => {
          turno.estado = 'Cancelado';
          turno.comentario = comentario;
        });
    }
  }

  rechazarTurno(turno: Turno) {
    if (!turno.id) return;
    const comentario = prompt('Ingrese el motivo de rechazo:');
    if (comentario) {
      this.turnosService
        .actualizarTurno(turno.id, {
          estado: 'Rechazado',
          comentario,
        })
        .subscribe(() => {
          turno.estado = 'Rechazado';
          turno.comentario = comentario;
        });
    }
  }

  aceptarTurno(turno: Turno) {
    if (!turno.id) return;
    this.turnosService
      .actualizarTurno(turno.id, { estado: 'Aceptado' })
      .subscribe(() => {
        turno.estado = 'Aceptado';
      });
  }

  finalizarTurno(turno: Turno) {
    // if (!turno.id) return;
    // const comentario = prompt('Ingrese reseña y diagnóstico:');
    // if (comentario) {
    //   this.turnosService
    //     .actualizarTurno(turno.id, {
    //       estado: 'Realizado',
    //       comentario,
    //     })
    //     .subscribe(() => {
    //       turno.estado = 'Realizado';
    //       turno.comentario = comentario;
    //       // Obtener el pacienteId y navegar al componente HistoriaClinica
    //       this.router.navigate(['/historia-clinica'], {
    //         queryParams: { pacienteId: turno.pacienteId }, // Pasa pacienteId como query param
    //       });
    //     });
    // }

    this.router.navigate(['/historia-clinica'], {
      queryParams: { pacienteId: turno.pacienteId }, // Pasa pacienteId como query param
    });
  }

  verResena(turno: Turno) {
    alert(`Reseña del turno:\n${turno.comentario}`);
  }
}
