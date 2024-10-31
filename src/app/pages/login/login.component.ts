import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  imagenPerfilURL: string | null = null;
  imagenPortadaURL: string | null = null;
  mensaje: string = '';
  esExito: boolean = false;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private auth: Auth
  ) {}

  async iniciarSesion() {
    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;

    try {
      const usuarioAutenticado = await this.authService.login(email, password);

      if (usuarioAutenticado) {
        const usuariosRef = collection(this.firestore, 'usuarios');
        const q = query(usuariosRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const usuarioData = querySnapshot.docs[0].data();
          const rol = usuarioData['rol'];
          const aprobado = usuarioData['aprobado'] === true;
          const verificado = usuarioData['verificado'] === true;

          // Comprobar si el correo electrónico ha sido verificado después de volver a iniciar sesión
          if (usuarioAutenticado.emailVerified) {
            const usuarioRef = doc(usuariosRef, querySnapshot.docs[0].id);
            await updateDoc(usuarioRef, { verificado: true });
          }

          // Verificar condiciones de acceso según el rol
          if (rol === 'especialista') {
            const usuarioRef = doc(usuariosRef, querySnapshot.docs[0].id);
            const usuarioActualizado = await getDoc(usuarioRef);
            const aprobadoActualizado =
              usuarioActualizado.data()?.['aprobado'] === true;
            const verificadoActualizado =
              usuarioActualizado.data()?.['verificado'] === true;

            if (!aprobadoActualizado || !verificadoActualizado) {
              this.mostrarMensaje(
                'La cuenta de especialista aún no ha sido aprobada o verificada.',
                false
              );
              return;
            } else {
              this.router.navigate(['/especialista-turnos']);
              return;
            }
          }

          if (rol === 'paciente' && !verificado) {
            this.mostrarMensaje(
              'Por favor, verifica tu correo electrónico.',
              false
            );
            return;
          } else {
            this.router.navigate(['/mis-turnos']);
          }

          // Redirigir si el rol es administrador
          if (rol === 'administrador') {
            this.router.navigate(['/usuarios']);
            return;
          }

          // Asignar URLs de imágenes para otros roles
          this.imagenPerfilURL = usuarioData['imagenPerfilURL'] || null;
          this.imagenPortadaURL = usuarioData['imagenPortadaURL'] || null;
          this.mostrarMensaje('Inicio de sesión exitoso.', true);
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.mostrarMensaje(
        'Error al iniciar sesión. Verifique sus credenciales e inténtelo nuevamente.',
        false
      );
    }
  }

  private mostrarMensaje(mensaje: string, exito: boolean) {
    this.mensaje = mensaje;
    this.esExito = exito;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000); // El mensaje se oculta después de 5 segundos
  }
}
