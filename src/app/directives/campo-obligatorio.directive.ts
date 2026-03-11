import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCampoObligatorio]',
  standalone: true,
})
export class CampoObligatorioDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('blur') onBlur() {
    const inputValue = this.el.nativeElement.value.trim();
    if (!inputValue) {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
      this.renderer.setAttribute(
        this.el.nativeElement,
        'placeholder',
        'Este campo es obligatorio'
      );
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'border', '1px solid #ccc');
    }
  }
}
