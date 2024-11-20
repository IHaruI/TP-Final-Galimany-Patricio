import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { AuthService } from '../services/auth.service';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  edad: number;
  dni: string;
  imagen: string;
  uid: string;
}

@Component({
  selector: 'app-exportar-exel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exportar-exel.component.html',
  styleUrls: ['./exportar-exel.component.css'],
})
export class ExportarExelComponent implements OnInit {
  usuarios: Usuario[] = [];
  administradores: Usuario[] = [];
  especialistas: Usuario[] = [];
  pacientes: Usuario[] = [];
  mensajeEstado: string = '';

  constructor(private auth: AuthService, private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarUsuarios();
    this.separarPorRol();
  }

  async cargarUsuarios() {
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const snapshot = await getDocs(usuariosRef);

      this.usuarios = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            nombre: doc.data()['nombre'],
            apellido: doc.data()['apellido'],
            email: doc.data()['email'],
            rol: doc.data()['rol'],
            edad: doc.data()['edad'],
            dni: doc.data()['dni'],
            imagen: doc.data()['imagenPerfilURL'],
            uid: doc.data()['uid'],
          } as Usuario)
      );
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  separarPorRol() {
    this.administradores = this.usuarios.filter(
      (usuario) => usuario.rol === 'administrador'
    );
    this.especialistas = this.usuarios.filter(
      (usuario) => usuario.rol === 'especialista'
    );
    this.pacientes = this.usuarios.filter(
      (usuario) => usuario.rol === 'paciente'
    );
  }

  async exportarUsuariosExcel() {
    try {
      const datos = this.usuarios.map((usuario) => ({
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        DNI: usuario.dni,
        Edad: usuario.edad,
        Email: usuario.email,
        Rol: usuario.rol,
      }));

      this.generarArchivoExcel(datos, 'todos_los_usuarios.xlsx');
    } catch (error) {
      console.error('Error al exportar usuarios:', error);
    }
  }

  private mostrarMensaje(estado: string, duracion: number = 5000) {
    this.mensajeEstado = estado;

    setTimeout(() => {
      this.mensajeEstado = '';
    }, duracion);
  }

  async exportarUsuarioExcel(usuario: Usuario) {
    try {
      const turnosRef = collection(this.firestore, 'turnos');
      const turnosQuery = query(
        turnosRef,
        where('pacienteId', '==', usuario.uid),
        where('estado', '==', 'Realizado')
      );

      const turnosSnapshot = await getDocs(turnosQuery);

      if (turnosSnapshot.empty) {
        this.mostrarMensaje(
          'No se encontraron turnos realizados para este paciente.',
          5000
        );
        return;
      }

      const datos = turnosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Nombre: data['nombre'],
          Apellido: data['apellido'],
          Especialidad: data['especialidad'],
          Especialista: data['especialista'],
          Fecha: data['fecha'].toDate().toLocaleString(),
          Hora: data['hora'],
          Peso: data['peso'],
          Altura: data['altura'],
          Temperatura: data['temperatura'],
          Presión: data['presion'],
          Comentario: data['comentario'],
          DatosDinamicos: (data['datosDinamicos'] || [])
            .map(
              (item: { clave: string; valor: string }) =>
                `${item.clave}: ${item.valor}`
            )
            .join(', '),
        };
      });

      const nombreArchivo = `Turnos_${usuario.nombre}_${usuario.apellido}.xlsx`;
      this.generarArchivoExcel(datos, nombreArchivo);

      this.mostrarMensaje(
        `Archivo Excel generado exitosamente para ${usuario.nombre} ${usuario.apellido}.`,
        5000
      );
    } catch (error) {
      console.error('Error al exportar turnos del usuario:', error);
      this.mostrarMensaje(
        'Ocurrió un error al intentar exportar los turnos.',
        5000
      );
    }
  }

  private generarArchivoExcel(datos: any[], nombreArchivo: string) {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, nombreArchivo);
  }
}
