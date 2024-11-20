import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnChanges,
} from '@angular/core';

@Directive({
  selector: '[appMensajeRol]',
  standalone: true,
})
export class MensajeRolDirective implements OnChanges {
  @Input('rol') rol!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    let mensaje: string;

    if (this.rol === 'Especialista') {
      mensaje = 'Usted es un especialista';
    } else if (this.rol === 'Paciente') {
      mensaje = 'Usted es un paciente';
    } else {
      mensaje = 'Usted es un administrador';
    }

    this.renderer.setProperty(this.el.nativeElement, 'textContent', mensaje);
  }
}
