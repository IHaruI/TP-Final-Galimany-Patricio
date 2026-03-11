import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true,
})
export class FormatoFechaPipe implements PipeTransform {
  transform(dia: string): string {
    const diasMap: { [key: string]: string } = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };
    return diasMap[dia.toLowerCase()] || dia;
  }
}
