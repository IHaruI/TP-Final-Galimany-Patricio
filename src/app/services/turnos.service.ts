import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  doc,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../interfaces/turno.interface';
import { Timestamp } from 'firebase/firestore';
import { switchMap } from 'rxjs/operators';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';

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
        snapshot.docs.map((doc) => {
          const data = doc.data();
          const datosDinamicos = Array.isArray(data['datosDinamicos'])
            ? data['datosDinamicos'].map((item: any) => ({
                clave: item.clave,
                valor: item.valor,
              }))
            : [];
          return { id: doc.id, ...data, datosDinamicos } as Turno;
        })
      )
    );
  }

  obtenerTurnosPorEspecialista(especialista: string): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('especialista', '==', especialista));
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              datosDinamicos: doc.data()['datosDinamicos'] || [],
            } as Turno)
        )
      )
    );
  }

  obtenerFechaTurnoPaciente(pacienteId: string): Observable<string | null> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('pacienteId', '==', pacienteId));

    return from(
      getDocs(q).then((snapshot) => {
        if (!snapshot.empty) {
          const turno = snapshot.docs[0].data();

          const fecha = turno['fecha'];
          const hora = turno['hora'];

          if (
            fecha &&
            typeof fecha.seconds === 'number' &&
            typeof fecha.nanoseconds === 'number'
          ) {
            const dateObj = new Date(fecha.seconds * 1000);

            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();

            let formattedDate = `${day}/${month}/${year}`;

            if (hora) {
              formattedDate += ` ${hora}`;
            }

            return formattedDate;
          } else {
            console.warn(
              'El campo fecha no es un Timestamp válido o la hora no está disponible.'
            );
            return null;
          }
        } else {
          console.warn('No se encontraron turnos para este paciente.');
          return null;
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
          const fecha = data['fecha'] ? data['fecha'].toDate() : null;
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

  agregarCamposTurno(
    id: string,
    data: {
      altura: number;
      peso: number;
      temperatura: number;
      presion: string;
      datosDinamicos: { clave: string; valor: string }[];
    }
  ) {
    const turnosCollectionRef = collection(this.firestore, 'turnos');
    const q = query(turnosCollectionRef, where('pacienteId', '==', id));

    return from(getDocs(q)).pipe(
      switchMap((querySnapshot: QuerySnapshot<DocumentData>) => {
        if (querySnapshot.empty) {
          throw new Error(
            'No se encontró un turno con el pacienteId especificado'
          );
        }

        const turnoDoc = querySnapshot.docs[0];
        const turnoRef = doc(this.firestore, 'turnos', turnoDoc.id);

        return from(updateDoc(turnoRef, data));
      })
    );
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
        return Array.from(new Set(especialidades));
      })
    );
  }

  obtenerFechasDisponibles(especialista: string): Observable<Date[]> {
    const fechas: Date[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 15; i++) {
      const fechaDisponible = new Date(hoy);
      fechaDisponible.setDate(hoy.getDate() + i);
      fechas.push(new Date(fechaDisponible.getTime()));
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
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('uid', '==', uid));

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
        return null;
      })
    );
  }

  guardarHistoriaClinica(historia: any): Observable<void> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    return from(
      addDoc(historiasRef, {
        ...historia,
      })
    ).pipe(map(() => {}));
  }

  obtenerHistorialClinicoPorPaciente(pacienteId: string): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    const q = query(historiasRef, where('pacienteId', '==', pacienteId));
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  obtenerHistorialClinicoPorEspecialista(
    especialistaId: string
  ): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    const q = query(
      historiasRef,
      where('especialistaId', '==', especialistaId)
    );
    return from(
      getDocs(q).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  obtenerHistorialCompleto(): Observable<any[]> {
    const historiasRef = collection(this.firestore, 'historias_clinicas');
    return from(
      getDocs(historiasRef).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }
}
