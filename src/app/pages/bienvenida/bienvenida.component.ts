import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css'],
})
export class BienvenidaComponent {
  constructor(private router: Router) {}

  // Navega a la página de registro
  irARegistro() {
    this.router.navigate(['/registro']);
  }

  // Navega a la página de login
  irALogin() {
    this.router.navigate(['/login']);
  }
}
