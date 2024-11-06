export interface Turno {
  id?: string;
  pacienteId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  especialista: string;
  fecha: Date;
  hora: string; // Agregar la propiedad 'hora'
  estado?: string;
  comentario?: string;
  realizado?: boolean;
  paciente?: string;
}
