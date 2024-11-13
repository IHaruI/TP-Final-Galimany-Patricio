import { Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { MisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { EspecialistaTurnosComponent } from './pages/especialista-turnos/especialista-turnos.component';
import { SolicitarTurnoComponent } from './pages/solicitar-turnos/solicitar-turnos.component';
import { AnimationComponent } from './animation/animation.component';
import { HistoriaClinicaComponent } from './historia-clinica/historia-clinica.component';
import { HistorialClinicaComponent } from './historial-clinica/historial-clinica.component';
import { animation } from '@angular/animations';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '', // Ruta por defecto (página de bienvenida)
    component: BienvenidaComponent,
    data: { animation: 'HomePage' },
  },
  {
    path: 'registro', // URL para acceder al componente de registro
    component: RegistroComponent,
    data: { animation: 'AboutPage' },
  },
  {
    path: 'login', // URL para acceder al componente de login
    component: LoginComponent,
    data: { animation: 'AboutPage' },
  },
  {
    path: 'usuarios', // URL para acceder al componente de usuarios
    component: UsuariosComponent,
    canActivate: [authGuard],
    data: { animation: 'HomePage' },
  },
  {
    path: 'mis-turnos',
    component: MisTurnosComponent,
    canActivate: [authGuard],
    data: { animation: 'HomePage' },
  },
  {
    path: 'especialista-turnos', // URL para acceder al componente de especialista-turnos
    component: EspecialistaTurnosComponent,
    canActivate: [authGuard],
    data: { animation: 'HomePage' },
  },
  {
    path: 'solicitar-turnos', // URL para acceder al componente de especialista-turnos
    component: SolicitarTurnoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'animation', // URL para acceder al componente de especialista-turnos
    component: AnimationComponent,
  },
  {
    path: 'historia-clinica', // URL para acceder al componente de especialista-turnos
    component: HistoriaClinicaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'historial-clinica', // URL para acceder al componente de especialista-turnos
    component: HistorialClinicaComponent,
    canActivate: [authGuard],
  },
  {
    path: '**', // Ruta para manejar rutas no encontradas
    redirectTo: '', // Redirige a la página de bienvenida
  },
];
