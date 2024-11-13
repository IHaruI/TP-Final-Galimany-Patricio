import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { Router } from '@angular/router';

interface Usuario {
  tipoUsuario: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  obraSocial?: string | null;
  especialidad?: string | null;
  email: string;
  password: string;
  imagenPerfilURL?: string;
  imagenPortadaURL?: string;
  rol: string;
  uid?: string;
  verificado?: boolean;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  registroForm = new FormGroup({
    tipoUsuario: new FormControl('Paciente', Validators.required),
    nombre: new FormControl('', Validators.required),
    apellido: new FormControl('', Validators.required),
    edad: new FormControl('', [Validators.required, Validators.min(1)]),
    dni: new FormControl('', [Validators.required, Validators.minLength(7)]),
    obraSocial: new FormControl(''),
    especialidadSeleccionada: new FormControl(''), // Campo para seleccionar especialidad
    especialidad: new FormControl('', [Validators.maxLength(100)]), // Campo para agregar más especialidades
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    imagenPerfil: new FormControl<File | null>(null),
    imagenPortada: new FormControl<File | null>(null),
  });

  tipoUsuarioSeleccionado: string | null = null;
  especialidades: string[] = ['Cardiología', 'Pediatría', 'Dermatología'];

  imagenPerfilFile: File | null = null;
  imagenPortadaFile: File | null = null;
  mensaje: string = '';
  esExito: boolean = false;
  captchaResolved: string | null = null;
  isLoading: boolean = false;

  constructor(
    private storage: Storage,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {}

  redirigirBienvenida() {
    this.router.navigate(['/bienvenida']);
  }

  cambiarTipoUsuario(tipo: string): void {
    this.registroForm.patchValue({
      tipoUsuario: tipo,
    });
    this.tipoUsuarioSeleccionado = tipo;
  }

  resolverCaptcha(response: string | null): void {
    if (response) {
      this.captchaResolved = response; // Guarda el valor si no es null
    } else {
      this.captchaResolved = null; // O maneja el caso cuando es null
    }
  }

  onFileSelected(event: Event, controlName: string) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0] || null;

    if (controlName === 'imagenPerfil') {
      this.imagenPerfilFile = file;
    } else if (controlName === 'imagenPortada') {
      this.imagenPortadaFile = file;
    }
  }

  // Función para concatenar la especialidad seleccionada y las adicionales
  getEspecialidadesConcatenadas(): string | null {
    const especialidadSeleccionada =
      this.registroForm.value.especialidadSeleccionada?.trim() || '';
    const especialidadesAdicionales =
      this.registroForm.value.especialidad?.trim() || '';

    const especialidades = [especialidadSeleccionada];

    if (especialidadesAdicionales) {
      especialidades.push(
        ...especialidadesAdicionales.split(',').map((e) => e.trim())
      );
    }

    return especialidades.filter((e) => e).join(', ');
  }

  async registrarUsuario() {
    // Muestra la animación de carga
    this.isLoading = true;

    // Verifica que el reCAPTCHA fue completado exitosamente
    if (!this.captchaResolved) {
      this.mostrarMensaje('Por favor, completa el captcha.', false);
      this.isLoading = false; // Oculta la animación si el captcha no se completó
      return;
    }

    const tipoUsuario = this.registroForm.value.tipoUsuario;

    if (tipoUsuario !== 'Paciente' && tipoUsuario !== 'Especialista') {
      this.mostrarMensaje(
        'Solo se pueden registrar Pacientes y Especialistas.',
        false
      );
      return;
    }

    const usuario: Usuario = {
      tipoUsuario,
      nombre: this.registroForm.value.nombre || '',
      apellido: this.registroForm.value.apellido || '',
      edad: Number(this.registroForm.value.edad) || 0,
      dni: this.registroForm.value.dni || '',
      email: this.registroForm.value.email || '',
      password: this.registroForm.value.password || '',
      rol: tipoUsuario === 'Paciente' ? 'paciente' : 'especialista',
      imagenPerfilURL: '',
      imagenPortadaURL: '',
      obraSocial:
        tipoUsuario === 'Paciente'
          ? this.registroForm.value.obraSocial || null
          : null,
      especialidad:
        tipoUsuario === 'Especialista'
          ? this.getEspecialidadesConcatenadas() || null
          : null,
      uid: '',
      verificado: false,
    };

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        usuario.email,
        usuario.password
      );
      await sendEmailVerification(userCredential.user);
      usuario.uid = userCredential.user.uid;

      if (this.imagenPerfilFile) {
        usuario.imagenPerfilURL = await this.uploadImage(
          this.imagenPerfilFile,
          `usuarios/${usuario.uid}/perfil.jpg`
        );
      }

      if (this.imagenPortadaFile) {
        usuario.imagenPortadaURL = await this.uploadImage(
          this.imagenPortadaFile,
          `usuarios/${usuario.uid}/portada.jpg`
        );
      }

      const usuariosRef = collection(this.firestore, 'usuarios');
      await addDoc(usuariosRef, usuario);

      this.mostrarMensaje(
        'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.',
        true
      );
      this.registroForm.reset();
      this.imagenPerfilFile = null;
      this.imagenPortadaFile = null;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      this.mostrarMensaje(
        'Error al registrar el usuario. Intenta nuevamente.',
        false
      );
    } finally {
      // Oculta la animación de carga
      this.isLoading = false;
    }
  }

  private async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    const metadata = {
      contentType: file.type,
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    await uploadTask;

    return await getDownloadURL(storageRef);
  }

  private mostrarMensaje(mensaje: string, exito: boolean) {
    this.mensaje = mensaje;
    this.esExito = exito;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000); // Mensaje se oculta después de 5 segundos
  }
}
