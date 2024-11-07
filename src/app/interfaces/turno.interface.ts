export interface Turno {
  id?: string;
  pacienteId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  especialista: string;
  fecha: Date;
  hora: string;
  estado?: string;
  comentario?: string;
  realizado?: boolean;
  paciente?: string;
}
