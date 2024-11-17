import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto',
  standalone: true,
})
export class NombreCompletoPipe implements PipeTransform {
  transform(nombre: string, apellido: string): string {
    return `${nombre} ${apellido}`;
  }
}
