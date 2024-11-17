import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuariosCollection: CollectionReference;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
  }

  isAuthenticated(): Observable<boolean> {
    return user(this.auth).pipe(map((user) => !!user));
  }

  async registrarUsuario(
    email: string,
    password: string
  ): Promise<UserCredential | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      console.error(
        'Error al registrar usuario en Firebase Authentication:',
        error
      );
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      let rol = 'desconocido';
      if (!querySnapshot.empty) {
        const usuarioData = querySnapshot.docs[0].data();
        rol = usuarioData['rol'] || 'desconocido';
      }

      const logRef = collection(this.firestore, 'logIngresos');
      await addDoc(logRef, {
        usuario: email,
        rol: rol,
        fecha: new Date().toISOString(),
      });

      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  logout() {
    return this.auth.signOut();
  }

  getUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  async getNombre(): Promise<string | null> {
    try {
      const pacienteData = await this.getPacienteData();
      return pacienteData.nombre;
    } catch (error) {
      console.error('Error al obtener el nombre:', error);
      return null;
    }
  }

  async getPacienteData(): Promise<{ nombre: string; apellido: string }> {
    const userId = this.getUid();
    if (userId) {
      const userData = await this.obtenerDatosUsuario(userId);
      return {
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
      };
    }
    return { nombre: '', apellido: '' };
  }

  async obtenerDatosUsuario(usuarioId: string): Promise<any> {
    const q = query(this.usuariosCollection, where('uid', '==', usuarioId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  }

  async obtenerDatosPaciente(usuarioId: string): Promise<any> {
    const q = query(this.usuariosCollection, where('uid', '==', usuarioId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data['nombre'],
        apellido: data['apellido'],
      };
    } else {
      return null;
    }
  }

  async obtenerDatosEspecialista(usuarioId: string | null): Promise<any> {
    if (!usuarioId) {
      return null;
    }

    const q = query(this.usuariosCollection, where('uid', '==', usuarioId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data['nombre'],
        apellido: data['apellido'],
      };
    } else {
      return null;
    }
  }

  async obtenerPacientesVerificados(): Promise<any[]> {
    const q = query(
      this.usuariosCollection,
      where('rol', '==', 'paciente'),
      where('verificado', '==', true)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });
  }

  async obtenerUsuarioPorEmail(email: string): Promise<any | null> {
    try {
      const q = query(this.usuariosCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener usuario de Firestore:', error);
      throw error;
    }
  }

  async getRol(): Promise<string | null> {
    const userId = this.getUid();
    if (userId) {
      const userData = await this.obtenerDatosUsuario(userId);
      return userData?.rol || null;
    }
    return null;
  }
}
