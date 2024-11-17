import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
  standalone: true,
})
export class ResaltarDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'blue');
    this.renderer.setStyle(this.el.nativeElement, 'fontWeight', 'bold');
  }
}
