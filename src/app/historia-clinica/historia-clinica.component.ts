import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../services/turnos.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.css'],
})
export class HistoriaClinicaComponent implements OnInit {
  historia = {
    altura: null,
    peso: null,
    temperatura: null,
    presion: '',
    datosDinamicos: [{ clave: '', valor: '' }],
    pacienteNombre: '',
    pacienteApellido: '',
    especialistaNombre: '',
    especialistaApellido: '',
    fechaConHora: '',
  };
  pacienteId: string = '';
  especialistaId: string | null;

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.especialistaId = this.authService.getUid() || '';
  }

  ngOnInit() {
    // Obtener el pacienteId de los queryParams
    this.route.queryParams.subscribe((params) => {
      this.pacienteId = params['pacienteId'] || ''; // Asignar pacienteId si existe
    });

    // Obtener los datos del paciente usando el pacienteId
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
          console.error('Error al obtener los datos del paciente:', error);
        });
    }

    // Obtener la fecha del turno del paciente
    this.turnosService
      .obtenerFechaTurnoPaciente(this.pacienteId)
      .subscribe((fechaConHora) => {
        if (fechaConHora) {
          this.historia.fechaConHora = fechaConHora;
          // Aquí puedes asignarlo a la propiedad de tu componente o hacer lo que necesites
        } else {
          console.warn('No se pudo obtener la fecha del turno.');
        }
      });

    // Obtener los datos del especialista usando el especialistaId
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
          console.error('Error al obtener los datos del paciente:', error);
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

    // Verifica si los campos tienen valores válidos
    if (
      !historiaData.altura ||
      !historiaData.peso ||
      !historiaData.temperatura
    ) {
      console.error('Faltan datos obligatorios');
      return;
    }

    this.turnosService.guardarHistoriaClinica(historiaData).subscribe({
      next: () => {
        console.log('Historia clínica guardada exitosamente');
      },
      error: (err) => {
        console.error('Error al guardar la historia clínica', err);
      },
    });
  }
}
