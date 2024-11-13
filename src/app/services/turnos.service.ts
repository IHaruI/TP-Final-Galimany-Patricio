import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  doc,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../interfaces/turno.interface';
import { Timestamp } from 'firebase/firestore';

interface Especialista {
  uid: string;
  nombre: string;
  especialidad: string;
  tipoUsuario: string;
}

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  constructor(private firestore: Firestore) {}

  obtenerDatosUsuario(usuarioId: string): Observable<any> {
    const usuarioRef = doc(this.firestore, `usuarios/${usuarioId}`);
    return from(getDoc(usuarioRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } : null))
    );
  }

  obtenerTurnosPaciente(pacienteId: string): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('pacienteId', '==', pacienteId));
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Turno))
      )
    );
  }

  obtenerTurnosPorEspecialista(especialista: string): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('especialista', '==', especialista));
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Turno))
      )
    );
  }

  // Método para obtener la fecha y hora del turno del paciente
  obtenerFechaTurnoPaciente(pacienteId: string): Observable<string | null> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('pacienteId', '==', pacienteId));

    return from(
      getDocs(q).then((snapshot) => {
        if (!snapshot.empty) {
          // Obtener los datos del primer turno
          const turno = snapshot.docs[0].data();

          const fecha = turno['fecha']; // 'fecha' debe ser un campo Timestamp en Firestore
          const hora = turno['hora']; // 'hora' debe ser un campo tipo string (ej. "14:30:00")

          // Verificamos si 'fecha' es un Timestamp y si 'hora' está presente
          if (
            fecha &&
            typeof fecha.seconds === 'number' &&
            typeof fecha.nanoseconds === 'number'
          ) {
            // Convertimos el Timestamp a un objeto Date
            const dateObj = new Date(fecha.seconds * 1000);

            // Formateamos la fecha a "día/mes/año"
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1; // Recordar que los meses en JS van de 0 a 11
            const year = dateObj.getFullYear();

            // Si la hora está presente, la concatenamos a la fecha
            let formattedDate = `${day}/${month}/${year}`;

            if (hora) {
              formattedDate += ` ${hora}`; // Añadir la hora al formato
            }

            return formattedDate; // Devolver la fecha formateada con la hora
          } else {
            console.warn(
              'El campo fecha no es un Timestamp válido o la hora no está disponible.'
            );
            return null; // Si no es un Timestamp, retornamos null
          }
        } else {
          console.warn('No se encontraron turnos para este paciente.');
          return null; // Si no se encuentra el turno
        }
      })
    );
  }

  obtenerTurnos(): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    return from(
      getDocs(turnosRef).then((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          const fecha = data['fecha'] ? data['fecha'].toDate() : null; // Ajuste aquí
          return { id: doc.id, ...data, fecha } as Turno;
        })
      )
    );
  }

  cancelarTurno(id: string, motivo: string): Observable<void> {
    const turnoRef = doc(this.firestore, `turnos/${id}`);
    return from(
      updateDoc(turnoRef, { estado: 'Cancelado', motivoCancelacion: motivo })
    );
  }

  actualizarTurno(id: string, data: Partial<Turno>) {
    const turnoRef = doc(this.firestore, 'turnos', id);
    return from(updateDoc(turnoRef, data));
  }

  obtenerEspecialidades(): Observable<string[]> {
    const especialidades = ['Cardiología', 'Odontología', 'Dermatología'];
    return from(Promise.resolve(especialidades));
  }

  obtenerEspecialistasPorEspecialidad(
    especialidad: string
  ): Observable<Especialista[]> {
    const especialistasRef = collection(this.firestore, 'usuarios');
    const q = query(
      especialistasRef,
      where('tipoUsuario', '==', 'Especialista')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Especialista[];

        return docs.filter((especialista) =>
          especialista.especialidad
            .split(',')
            .map((e) => e.trim())
            .includes(especialidad)
        );
      })
    );
  }

  obtenerTodasEspecialidades(): Observable<string[]> {
    const especialistasRef = collection(this.firestore, 'usuarios');
    const q = query(
      especialistasRef,
      where('tipoUsuario', '==', 'Especialista')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const especialidades = snapshot.docs
          .map((doc) => (doc.data() as any)['especialidad'])
          .flatMap((especialidad: string) =>
            especialidad.split(',').map((e: string) => e.trim())
          );
        return Array.from(new Set(especialidades)); // Eliminar duplicados
      })
    );
  }

  obtenerFechasDisponibles(especialista: string): Observable<Date[]> {
    const fechas: Date[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Asegúrate de que la hora sea 00:00

    for (let i = 1; i <= 15; i++) {
      const fechaDisponible = new Date(hoy); // Crea una nueva fecha basada en hoy
      fechaDisponible.setDate(hoy.getDate() + i);
      fechas.push(new Date(fechaDisponible.getTime())); // Usa getTime() para evitar efectos de referencia
    }
    return from(Promise.resolve(fechas));
  }

  obtenerTurnosPorFecha(
    fecha: string,
    especialista: string
  ): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(
      turnosRef,
      where('fecha', '==', fecha),
      where('especialista', '==', especialista)
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    );
  }

  solicitarTurno(turno: Turno): Observable<void> {
    const turnosRef = collection(this.firestore, 'turnos');
    return from(addDoc(turnosRef, turno)).pipe(map(() => {}));
  }

  obtenerUsuarioPorUid(uid: string): Observable<any> {
    const usuariosRef = collection(this.firestore, 'usuarios'); // Referencia a la colección 'usuarios'
    const q = query(usuariosRef, where('uid', '==', uid)); // Buscar documentos donde el campo 'uid' sea igual al uid proporcionado

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Si se encuentra el documento con el UID, se devuelve el primer resultado
          const doc = querySnapshot.docs[0]; // Solo tomamos el primer documento
          return { id: doc.id, ...doc.data() };
        }
        return null; // Si no se encuentra, retornamos null
      })
    );
  }

  // Método para guardar historia clínica
  guardarHistoriaClinica(historia: any): Observable<void> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    return from(
      addDoc(historiasRef, {
        ...historia,
      })
    ).pipe(map(() => {}));
  }

  // Método para obtener el historial clínico de un paciente
  obtenerHistorialClinicoPorPaciente(pacienteId: string): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    const q = query(historiasRef, where('pacienteId', '==', pacienteId)); // Filtro por paciente
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  // Método para obtener el historial clínico de todos los pacientes de un especialista
  obtenerHistorialClinicoPorEspecialista(
    especialistaId: string
  ): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    const q = query(
      historiasRef,
      where('especialistaId', '==', especialistaId)
    ); // Filtro por especialista
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  // Método para obtener todos los historiales clínicos (para el administrador)
  obtenerHistorialCompleto(): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    return from(
      getDocs(historiasRef).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }
}
