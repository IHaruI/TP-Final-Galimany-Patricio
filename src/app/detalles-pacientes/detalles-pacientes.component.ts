import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../services/turnos.service';
import { CommonModule } from '@angular/common';
import { Turno } from '../interfaces/turno.interface';

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  imagen?: string;
}

@Component({
  selector: 'app-detalles-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-pacientes.component.html',
  styleUrls: ['./detalles-pacientes.component.css'],
})
export class DetallesPacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  turnosPacienteSeleccionado: Turno[] = [];
  modalVisible: boolean = false;
  resenaSeleccionada: string = '';

  constructor(private turnosService: TurnosService) {}

  ngOnInit() {
    this.cargarPacientesAtendidos();
  }

  cargarPacientesAtendidos() {
    this.turnosService.obtenerPacientesAtendidos().subscribe((pacientes) => {
      this.pacientes = pacientes;
    });
  }

  seleccionarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.cargarTurnosDelPaciente(paciente.id);
  }

  cargarTurnosDelPaciente(pacienteId: string) {
    this.turnosService
      .obtenerTurnosPorPaciente(pacienteId)
      .subscribe((turnos) => {
        this.turnosPacienteSeleccionado = turnos;
      });
  }

  verResena(turno: Turno) {
    this.resenaSeleccionada = turno.comentario ?? 'Sin reseña disponible';
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }
}
