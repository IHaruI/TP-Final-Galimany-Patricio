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

  obtenerFechasDisponibles(especialista: string): Observable<Date[]> {
    const fechas: Date[] = [];
    const hoy = new Date();
    for (let i = 1; i <= 15; i++) {
      const fechaDisponible = new Date(hoy);
      fechaDisponible.setDate(hoy.getDate() + i);
      fechas.push(new Date(fechaDisponible.setHours(9, 0)));
      fechas.push(new Date(fechaDisponible.setHours(14, 0)));
    }
    return from(Promise.resolve(fechas));
  }

  solicitarTurno(turno: Turno): Observable<void> {
    const turnosRef = collection(this.firestore, 'turnos');
    return from(addDoc(turnosRef, turno)).pipe(map(() => {}));
  }
}
