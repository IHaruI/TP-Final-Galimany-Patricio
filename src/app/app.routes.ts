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
import { LogsComponent } from './pages/logs/logs.component';
import { DetallesPacientesComponent } from './detalles-pacientes/detalles-pacientes.component';
import { ExportarExelComponent } from './exportar-exel/exportar-exel.component';

export const routes: Routes = [
  {
    path: '',
    component: BienvenidaComponent,
    data: { animation: 'HomePage' },
  },
  {
    path: 'registro',
    component: RegistroComponent,
    data: { animation: 'AboutPage' },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'AboutPage' },
  },
  {
    path: 'usuarios',
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
    path: 'especialista-turnos',
    component: EspecialistaTurnosComponent,
    canActivate: [authGuard],
    data: { animation: 'HomePage' },
  },
  {
    path: 'solicitar-turnos',
    component: SolicitarTurnoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'animation',
    component: AnimationComponent,
  },
  {
    path: 'historia-clinica',
    component: HistoriaClinicaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'historial-clinica',
    component: HistorialClinicaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'detalles-pacientes',
    component: DetallesPacientesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'exportar-exel',
    component: ExportarExelComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
