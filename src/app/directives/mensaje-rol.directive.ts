import { Directive, Input, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appMensajeRol]',
  standalone: true,
})
export class MensajeRolDirective {
  @Input('rol') rol!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    if (this.rol) {
      const mensaje =
        this.rol === 'Especialista'
          ? 'Usted es un especialista'
          : 'Usted es un paciente';
      this.renderer.setProperty(this.el.nativeElement, 'textContent', mensaje);
    }
  }
}
