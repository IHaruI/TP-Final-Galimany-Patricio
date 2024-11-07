import { Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { MisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { EspecialistaTurnosComponent } from './pages/especialista-turnos/especialista-turnos.component';
import { SolicitarTurnoComponent } from './pages/solicitar-turnos/solicitar-turnos.component';
import { AnimationComponent } from './animation/animation.component';

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
    path: 'usuarios', // URL para acceder al componente de usuarios
    component: UsuariosComponent,
  },
  {
    path: 'mis-turnos', // URL para acceder al componente de mis-turnos
    component: MisTurnosComponent,
  },
  {
    path: 'especialista-turnos', // URL para acceder al componente de especialista-turnos
    component: EspecialistaTurnosComponent,
  },
  {
    path: 'solicitar-turnos', // URL para acceder al componente de especialista-turnos
    component: SolicitarTurnoComponent,
  },
  {
    path: 'animation', // URL para acceder al componente de especialista-turnos
    component: AnimationComponent,
  },
  {
    path: '**', // Ruta para manejar rutas no encontradas
    redirectTo: '', // Redirige a la página de bienvenida
  },
];
