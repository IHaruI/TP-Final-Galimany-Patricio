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
  disponibilidadEspecialista: string[] = [];
  turnoOcupado: string[] = [];
  especialidadSeleccionada: string = '';
  especialistaSeleccionado: any | null = null;
  fechaSeleccionada: string | null = null;
  pacienteId: string | null = null;
  nombrePaciente: string = '';
  apellidoPaciente: string = '';
  mesActual: number;
  anioActual: number;
  diaSeleccionado: Date | null = null;
  maxDias: number = 15;
  diasDelMes: Date[] = [];
  horaSeleccionada: string | null = null;
  mensajeError: string = '';
  pacientesVerificados: any[] = [];
  esAdministrador = false;
  pacienteSeleccionadoUid: string | null = null;
  mensajeExito: string = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {
    const hoy = new Date();
    this.mesActual = 1 + hoy.getMonth();
    this.anioActual = hoy.getFullYear();
    this.generarDiasDelMes();
  }

  async ngOnInit(): Promise<void> {
    this.pacienteId = this.authService.getUid();

    if (this.pacienteId) {
      const usuario = await this.authService.obtenerDatosUsuario(
        this.pacienteId
      );

      if (usuario && usuario.rol === 'administrador') {
        this.esAdministrador = true;
        this.obtenerPacientesVerificados();
      } else {
        const data = await this.authService.getPacienteData();
        if (data) {
          this.nombrePaciente = data.nombre;
          this.apellidoPaciente = data.apellido;
        }
      }
    }
    this.turnosService
      .obtenerTodasEspecialidades()
      .subscribe((especialidades) => {
        this.especialidades = especialidades;
      });

    this.obtenerEspecialidades();
  }

  async obtenerPacientesVerificados(): Promise<void> {
    const pacientes = await this.authService.obtenerPacientesVerificados();
    this.pacientesVerificados = pacientes;
  }

  async seleccionarPaciente(): Promise<void> {
    if (this.pacienteSeleccionadoUid) {
      const paciente = await this.authService.obtenerDatosUsuario(
        this.pacienteSeleccionadoUid
      );
      if (paciente) {
        this.nombrePaciente = paciente.nombre;
        this.apellidoPaciente = paciente.apellido;
      }
    }
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  generarDiasDelMes() {
    const hoy = new Date();
    this.diasDelMes = [];

    for (let i = 0; i <= this.maxDias; i++) {
      const dia = new Date();
      dia.setDate(hoy.getDate() + i);
      this.diasDelMes.push(dia);
    }
  }

  isDiaDisabled(dia: Date): boolean {
    const hoy = new Date();
    return dia < hoy;
  }

  cambiarMes(cambio: number) {
    this.mesActual += cambio;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.generarDiasDelMes();
  }

  seleccionarDia(dia: Date) {
    this.diaSeleccionado = dia;
    this.fechaSeleccionada = `${dia.getDate()}/${
      dia.getMonth() + 1
    }/${dia.getFullYear()}`;

    this.obtenerDisponibilidad();
    this.obtenerTurnosOcupados();
  }

  obtenerTurnosOcupados() {
    if (this.fechaSeleccionada && this.especialistaSeleccionado?.nombre) {
      this.turnosService
        .obtenerTurnosPorFecha(
          this.fechaSeleccionada,
          this.especialistaSeleccionado.nombre
        )
        .subscribe((turnos) => {
          this.turnoOcupado = turnos.map((turno) => turno.hora);
          this.disponibilidadEspecialista =
            this.disponibilidadEspecialista.filter(
              (hora) => !this.turnoOcupado.includes(hora)
            );
        });
    } else {
      console.error('Fecha o especialista no seleccionados');
    }
  }

  generarHorariosDisponibles() {
    this.disponibilidadEspecialista = [];
    const inicio = new Date();
    inicio.setHours(10, 0, 0, 0);
    const fin = new Date();
    fin.setHours(14, 0, 0, 0);

    while (inicio < fin) {
      this.disponibilidadEspecialista.push(
        inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      inicio.setMinutes(inicio.getMinutes() + 30);
    }
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
        });
    }
  }

  seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.filtrarEspecialistasPorEspecialidad();
  }

  obtenerImagenEspecialidad(especialidad: string): string {
    return `${especialidad}.png`;
  }

  onImageError(event: any) {
    const img = event.target as HTMLImageElement;
    img.src = 'default.png';
  }

  resetearEstado() {
    this.especialistasFiltrados = [];
    this.fechaSeleccionada = null;
    this.especialistaSeleccionado = null;
    this.horaSeleccionada = null;
    this.disponibilidadEspecialista = [];
    this.turnoOcupado = [];
  }

  seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.disponibilidadEspecialista = [];
  }

  async obtenerDisponibilidad() {
    if (this.especialistaSeleccionado && this.fechaSeleccionada) {
      const [dia, mes, anio] = this.fechaSeleccionada.split('/').map(Number);
      const fechaObj = new Date(anio, mes - 1, dia);

      const diaSeleccionado = fechaObj
        .toLocaleDateString('es-ES', { weekday: 'long' })
        .toLowerCase();

      const especialistaId = this.especialistaSeleccionado.uid;

      this.turnosService
        .obtenerUsuarioPorUid(especialistaId)
        .subscribe((usuarioDoc) => {
          if (usuarioDoc) {
            const disponibilidad = usuarioDoc.disponibilidad.find(
              (d: any) => d[diaSeleccionado]
            );

            if (disponibilidad) {
              const horarios = disponibilidad[diaSeleccionado].split(' - ');

              const inicio = new Date();
              inicio.setHours(
                parseInt(horarios[0].split(':')[0]),
                parseInt(horarios[0].split(':')[1]),
                0,
                0
              ); // Hora de inicio
              const fin = new Date();
              fin.setHours(
                parseInt(horarios[1].split(':')[0]),
                parseInt(horarios[1].split(':')[1]),
                0,
                0
              ); // Hora de fin

              this.disponibilidadEspecialista = [];
              while (inicio < fin) {
                this.disponibilidadEspecialista.push(
                  inicio.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                );
                inicio.setMinutes(inicio.getMinutes() + 30);
              }
            } else {
              this.disponibilidadEspecialista = [
                'No hay disponibilidad para este día.',
              ];
            }
          } else {
            console.error('No se pudo obtener los datos del especialista');
          }
        });
    }
  }

  solicitarTurno() {
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mensajeExito = '';
      return;
    }

    if (!this.pacienteId) {
      this.mensajeError = 'No se pudo obtener el ID del paciente.';
      this.mensajeExito = '';
      return;
    }

    const [dia, mes, anio] = this.fechaSeleccionada.split('/').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const especialistaId = this.especialistaSeleccionado?.nombre;

    this.turnosService.obtenerTurnos().subscribe((turnos) => {
      const turnoExistente = turnos.find(
        (t) =>
          t.fecha.getTime() === fecha.getTime() &&
          t.hora === this.horaSeleccionada &&
          t.especialidad === this.especialidadSeleccionada
      );

      if (turnoExistente) {
        this.mensajeError =
          'Ya existe un turno reservado para este día y hora con este especialista.';
      } else {
        const nuevoTurno = {
          pacienteId: this.pacienteId as string,
          especialidad: this.especialidadSeleccionada,
          especialista: especialistaId,
          fecha: fecha,
          hora: this.horaSeleccionada || '',
          estado: 'Pendiente',
          nombre: this.nombrePaciente,
          apellido: this.apellidoPaciente,
        };

        this.turnosService.solicitarTurno(nuevoTurno).subscribe(() => {
          this.mensajeError = '';
          this.mensajeExito = 'Turno solicitado exitosamente';

          setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);

          this.resetearEstado();
        });
      }
    });
  }
}
