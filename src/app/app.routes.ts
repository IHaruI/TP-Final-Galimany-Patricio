import { Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  {
    path: '', // Ruta por defecto (página de bienvenida)
    component: BienvenidaComponent,
  },
  {
    path: 'registro', // URL para acceder al componente de registro
    component: RegistroComponent,
  },
  {
    path: 'login', // URL para acceder al componente de login
    component: LoginComponent,
  },
  {
    path: 'usuarios', // URL para acceder al componente de login
    component: UsuariosComponent,
  },
  {
    path: '**', // Ruta para manejar rutas no encontradas
    redirectTo: '', // Redirige a la página de bienvenida
  },
];
