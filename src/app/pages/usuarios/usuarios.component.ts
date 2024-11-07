import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  updateDoc,
  doc,
  getDocs,
  addDoc,
} from '@angular/fire/firestore';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { RegistroComponent } from '../registro/registro.component';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../interfaces/turno.interface';
import { PerfilComponent } from '../../perfil/perfil.component';
import { SolicitarTurnoComponent } from '../solicitar-turnos/solicitar-turnos.component';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  aprobado: boolean;
  verificado: boolean;
  imagenPerfilURL?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegistroComponent,
    FormsModule,
    PerfilComponent,
    SolicitarTurnoComponent,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario = false;
  mostrarRegistroComponent = false;
  nuevoUsuarioForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido: new FormControl('', Validators.required),
    edad: new FormControl('', [Validators.required, Validators.min(18)]),
    dni: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    rol: new FormControl('administrador', Validators.required),
  });
  selectedFile: File | null = null;
  mensaje: string | null = null;
  exitoMensaje = false;
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  mostrarModalCancelacion = false;
  turnoSeleccionado: Turno | null = null;
  motivoCancelacion: string = '';

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private storage: Storage,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    this.usuarios = snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Usuario)
    );
    this.obtenerTurnos();
  }

  obtenerTurnos() {
    this.turnosService.obtenerTurnos().subscribe((turnos) => {
      this.turnos = turnos;
      this.turnosFiltrados = turnos;
    });
  }

  filtrarTurnos() {
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

  puedeCancelar(turno: Turno): boolean {
    return turno.estado
      ? !['Aceptado', 'Realizado', 'Rechazado'].includes(turno.estado)
      : false;
  }

  cancelarTurno(turno: Turno) {
    this.turnoSeleccionado = turno;
    this.mostrarModalCancelacion = true;
  }

  confirmarCancelacion() {
    const motivo = this.motivoCancelacion?.trim() ?? '';

    if (
      this.turnoSeleccionado &&
      this.turnoSeleccionado.id &&
      motivo.length > 0
    ) {
      this.turnosService
        .cancelarTurno(this.turnoSeleccionado.id, motivo as string)
        .subscribe(() => {
          this.turnoSeleccionado!.estado = 'Cancelado';
          this.motivoCancelacion = '';
          this.mostrarModalCancelacion = false;
        });
    }
  }

  cerrarModal() {
    this.mostrarModalCancelacion = false;
    this.motivoCancelacion = '';
  }

  rolForm = new FormGroup({
    rol: new FormControl('paciente', Validators.required),
  });

  onRoleChange() {
    const rolSeleccionado = this.rolForm.get('rol')?.value;
    this.mostrarFormulario = rolSeleccionado === 'administrador';
    this.mostrarRegistroComponent = rolSeleccionado === 'paciente-especialista';
  }

  async toggleAprobacion(usuario: Usuario) {
    try {
      const usuarioRef = doc(this.firestore, 'usuarios', usuario.id);
      await updateDoc(usuarioRef, { aprobado: !usuario.aprobado });
      usuario.aprobado = !usuario.aprobado;

      this.mensaje = `El estado de aprobación ha sido actualizado para ${usuario.nombre}`;
      this.exitoMensaje = true;
    } catch (error) {
      console.error('Error al actualizar la aprobación:', error);
      this.mensaje = 'Error al actualizar el estado de aprobación.';
      this.exitoMensaje = false;
    } finally {
      setTimeout(() => (this.mensaje = null), 3000);
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async crearUsuario() {
    const { email, password, rol, ...datosUsuario } =
      this.nuevoUsuarioForm.value;

    try {
      const userCredential = await this.authService.registrarUsuario(
        email!,
        password!
      );

      if (userCredential) {
        const uid = userCredential.user.uid;
        let imagenPerfilURL: string | undefined;

        if (this.selectedFile) {
          const storageRef = ref(this.storage, `imagenes_perfil/${uid}`);
          const uploadTask = uploadBytesResumable(
            storageRef,
            this.selectedFile
          );
          await uploadTask;
          imagenPerfilURL = await getDownloadURL(storageRef);
        }

        const nuevoUsuario = {
          uid,
          ...datosUsuario,
          email,
          rol,
          tipoUsuario: 'Administrador',
          aprobado: rol === 'especialista' ? false : true,
          verificado: false,
          imagenPerfilURL,
        };

        const usuariosRef = collection(this.firestore, 'usuarios');
        await addDoc(usuariosRef, nuevoUsuario);

        this.mensaje = 'Usuario creado exitosamente.';
        this.exitoMensaje = true;
        this.nuevoUsuarioForm.reset();
        this.selectedFile = null;
        this.ngOnInit();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      this.mensaje = 'Hubo un error al crear el usuario. Intente nuevamente.';
      this.exitoMensaje = false;
    } finally {
      setTimeout(() => (this.mensaje = null), 3000);
    }
  }
}
