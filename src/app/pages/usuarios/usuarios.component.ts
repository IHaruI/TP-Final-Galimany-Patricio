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
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { RegistroComponent } from '../registro/registro.component';

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
  imports: [CommonModule, ReactiveFormsModule, RegistroComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario = false; // Variable para mostrar u ocultar el formulario
  mostrarRegistroComponent = false; // Para el componente RegistroComponent
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

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private storage: Storage
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
  }

  // Nuevo FormGroup solo para el selector de rol
  rolForm = new FormGroup({
    rol: new FormControl('paciente', Validators.required),
  });

  // Método para manejar el cambio de rol
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
        let imagenPerfilURL: string | undefined;
        if (this.selectedFile) {
          const storageRef = ref(
            this.storage,
            `imagenes_perfil/${userCredential.user.uid}`
          );
          const uploadTask = uploadBytesResumable(
            storageRef,
            this.selectedFile
          );
          await uploadTask;
          imagenPerfilURL = await getDownloadURL(storageRef);
        }

        const nuevoUsuario = {
          ...datosUsuario,
          email,
          rol,
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
