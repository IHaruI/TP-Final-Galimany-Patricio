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
import { switchMap } from 'rxjs/operators';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { AuthService } from './auth.service';

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
  constructor(private firestore: Firestore, private auth: AuthService) {}

  almacenarTurnosPorDia(): Observable<void> {
    const turnosRef = collection(this.firestore, 'turnosPorDia');

    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];

    const turnosDelDiaRef = doc(turnosRef, fechaStr);

    return from(
      getDoc(turnosDelDiaRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const existingData = docSnapshot.data();
          const cantidad = existingData?.['cantidad'] || 0;
          return updateDoc(turnosDelDiaRef, { cantidad: cantidad + 1 });
        } else {
          return setDoc(turnosDelDiaRef, { cantidad: 1 });
        }
      })
    );
  }

  actualizarTurnosPorEspecialista(
    uid: string,
    nombre: string,
    apellido: string
  ): Observable<void> {
    const turnosRef = collection(this.firestore, 'turnosPorEspecialista');
    const especialistaRef = doc(turnosRef, uid);

    return from(
      getDoc(especialistaRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const existingData = docSnapshot.data();
          const cantidad = existingData['cantidad'] || 0;
          return updateDoc(especialistaRef, {
            cantidad: cantidad + 1,
          });
        } else {
          return setDoc(especialistaRef, {
            nombre,
            apellido,
            cantidad: 1,
          });
        }
      })
    );
  }

  actualizarTurnosPorEspecialidad(
    especialistaUid: string,
    especialidad: string
  ): Observable<void> {
    const turnosRef = collection(this.firestore, 'turnosPorEspecialidad');
    const especialistaRef = doc(turnosRef, especialistaUid);

    return from(
      getDoc(especialistaRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const existingData = docSnapshot.data();
          const cantidad = existingData['cantidad'] || 0;
          const especialidadExistente = existingData['especialidad'];

          if (especialidadExistente === especialidad) {
            return updateDoc(especialistaRef, {
              cantidad: cantidad + 1,
            });
          } else {
            const nuevaEspecialidadRef = doc(
              turnosRef,
              `${especialistaUid}_${especialidad}`
            );
            return getDoc(nuevaEspecialidadRef).then((newDocSnapshot) => {
              if (newDocSnapshot.exists()) {
                const nuevaCantidad = newDocSnapshot.data()['cantidad'] || 0;
                return updateDoc(nuevaEspecialidadRef, {
                  cantidad: nuevaCantidad + 1,
                });
              } else {
                return setDoc(nuevaEspecialidadRef, {
                  cantidad: 1,
                  especialidad: especialidad,
                });
              }
            });
          }
        } else {
          return setDoc(especialistaRef, {
            cantidad: 1,
            especialidad: especialidad,
          });
        }
      })
    );
  }

  actualizarTurnosFinalizadosPorEspecialista(
    especialista: string
  ): Observable<void> {
    const turnosPorEspecialistaRef = collection(
      this.firestore,
      'turnosFinalizadosPorEspecialista'
    );

    const especialistaRef = doc(turnosPorEspecialistaRef, especialista);

    return from(
      getDoc(especialistaRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const existingData = docSnapshot.data();
          const cantidad = existingData?.['cantidad'] || 0;
          return updateDoc(especialistaRef, { cantidad: cantidad + 1 });
        } else {
          return setDoc(especialistaRef, {
            especialista: especialista,
            cantidad: 1,
          });
        }
      })
    );
  }

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
    hora: string,
    comentario: string,
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
          console.log(
            'No se encontró un turno con el pacienteId especificado, creando nuevo...'
          );
          return from(
            addDoc(turnosCollectionRef, {
              ...data,
              pacienteId: id,
              estado: 'Pendiente',
            })
          );
        }

        const turnoCoincidente = querySnapshot.docs.find((doc) => {
          const docData = doc.data();
          return (
            docData['hora'] === hora &&
            docData['estado'] === 'Realizado' &&
            docData['comentario'] === comentario
          );
        });

        if (turnoCoincidente) {
          const turnoRef = doc(this.firestore, 'turnos', turnoCoincidente.id);
          return from(updateDoc(turnoRef, data));
        }

        console.log(
          'No se encontró un turno con la hora y estado coincidente, buscando otro...'
        );

        const turnoSinAltura = querySnapshot.docs.find(
          (doc) => !doc.data()['altura']
        );

        if (turnoSinAltura) {
          const turnoRef = doc(this.firestore, 'turnos', turnoSinAltura.id);
          return from(updateDoc(turnoRef, data));
        }

        console.log('Todos los turnos tienen altura, creando uno nuevo...');

        return from(
          addDoc(turnosCollectionRef, {
            ...data,
            pacienteId: id,
            estado: 'Pendiente',
          })
        );
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

  contarTurnosPorDia(fecha: Date): Observable<number> {
    const turnosRef = collection(this.firestore, 'turnos');

    const q = query(
      turnosRef,
      where('fecha', '>=', new Date(fecha.setHours(0, 0, 0, 0))), // Inicio del día
      where('fecha', '<', new Date(fecha.setHours(23, 59, 59, 999))) // Fin del día
    );

    return from(getDocs(q).then((snapshot) => snapshot.size));
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

  obtenerPacientesAtendidos(): Observable<any[]> {
    const historiasClinicasRef = collection(
      this.firestore,
      'historias_clinicas'
    );
    const especialistaId = this.auth.getUid();

    return from(
      getDocs(historiasClinicasRef).then(async (snapshot) => {
        const pacienteIdsSet = new Set(
          snapshot.docs
            .filter((doc) => doc.data()['especialistaId'] === especialistaId)
            .map((doc) => doc.data()['pacienteId'])
        );

        const usuariosRef = collection(this.firestore, 'usuarios');
        const usuariosSnapshot = await getDocs(usuariosRef);
        const pacientes = usuariosSnapshot.docs
          .map((doc) => doc.data())
          .filter((usuario) => pacienteIdsSet.has(usuario['uid']))
          .map((usuario) => ({
            id: usuario['uid'],
            nombre: usuario['nombre'],
            apellido: usuario['apellido'],
            imagen: usuario['imagenPerfilURL'] || 'assets/default-user.png',
          }));

        return pacientes;
      })
    );
  }

  obtenerTurnosPorPaciente(pacienteId: string): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('pacienteId', '==', pacienteId));
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
}
