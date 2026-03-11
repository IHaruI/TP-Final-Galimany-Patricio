import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroEspecialidad',
  standalone: true,
})
export class FiltroEspecialidadPipe implements PipeTransform {
  transform(especialidad: string): string {
    return especialidad.charAt(0).toUpperCase() + especialidad.slice(1);
  }
}
