import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../services/turnos.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.css'],
})
export class HistoriaClinicaComponent implements OnInit {
  historia = {
    altura: null as number | null,
    peso: null as number | null,
    temperatura: null as number | null,
    presion: '',
    datosDinamicos: [{ clave: '', valor: '' }],
    pacienteNombre: '',
    pacienteApellido: '',
    especialistaNombre: '',
    especialistaApellido: '',
    fechaConHora: '',
  };

  mensaje: string = '';
  mensajeError: boolean = false;
  pacienteId: string = '';
  hora: string = '';
  comentario: string = '';
  especialistaId: string | null;

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.especialistaId = this.authService.getUid() || '';
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.pacienteId = params['pacienteId'] || '';
      this.hora = params['hora'] || '';
      this.comentario = params['comentario'] || '';
    });

    if (this.pacienteId) {
      this.authService
        .obtenerDatosPaciente(this.pacienteId)
        .then((usuario) => {
          if (usuario) {
            this.historia.pacienteNombre = usuario.nombre;
            this.historia.pacienteApellido = usuario.apellido;
          }
        })
        .catch((error) => {
          this.mostrarMensaje('Error al obtener los datos del paciente', true);
        });
    }

    this.turnosService
      .obtenerFechaTurnoPaciente(this.pacienteId)
      .subscribe((fechaConHora) => {
        if (fechaConHora) {
          this.historia.fechaConHora = fechaConHora;
        } else {
          this.mostrarMensaje('No se pudo obtener la fecha del turno.', true);
        }
      });

    if (this.pacienteId) {
      this.authService
        .obtenerDatosEspecialista(this.especialistaId)
        .then((usuario) => {
          if (usuario) {
            this.historia.especialistaNombre = usuario.nombre;
            this.historia.especialistaApellido = usuario.apellido;
          }
        })
        .catch((error) => {
          this.mostrarMensaje(
            'Error al obtener los datos del especialista.',
            true
          );
        });
    }
  }

  agregarDatoDinamico() {
    if (this.historia.datosDinamicos.length < 3) {
      this.historia.datosDinamicos.push({ clave: '', valor: '' });
    }
  }

  guardarHistoriaClinica() {
    const historiaData = {
      ...this.historia,
      pacienteId: this.pacienteId,
      especialistaId: this.especialistaId,
    };

    if (
      historiaData.altura == null ||
      historiaData.peso == null ||
      historiaData.temperatura == null
    ) {
      this.mostrarMensaje('Faltan datos obligatorios.', true);
      return;
    }

    this.turnosService.guardarHistoriaClinica(historiaData).subscribe({
      next: () => {
        const turnoData = {
          altura: historiaData.altura as number,
          peso: historiaData.peso as number,
          temperatura: historiaData.temperatura as number,
          presion: historiaData.presion || '',
          datosDinamicos: historiaData.datosDinamicos || [],
        };

        this.turnosService
          .agregarCamposTurno(
            this.pacienteId,
            this.hora,
            this.comentario,
            turnoData
          )
          .subscribe({
            next: () => {
              this.mostrarMensaje(
                'Historia clínica guardada exitosamente.',
                false
              );
              setTimeout(() => {
                this.router.navigate(['/especialista-turnos']);
              }, 5000);
            },
            error: (err) => {
              this.mostrarMensaje('Error al agregar campos al turno.', true);
            },
          });
      },
      error: (err) => {
        this.mostrarMensaje('Error al guardar la historia clínica.', true);
      },
    });
  }

  mostrarMensaje(texto: string, esError: boolean) {
    this.mensaje = texto;
    this.mensajeError = esError;
    setTimeout(() => {
      this.mensaje = '';
    }, 3500);
  }
}
