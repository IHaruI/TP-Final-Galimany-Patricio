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
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuariosCollection: CollectionReference;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
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

      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  getUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  // Método que devuelve los datos del paciente autenticado
  async getPacienteData(): Promise<{ nombre: string; apellido: string }> {
    const userId = this.getUid();
    console.log('User ID:', userId); // Para verificar el ID
    if (userId) {
      const userData = await this.obtenerDatosUsuario(userId);
      console.log('User Data:', userData); // Verifica qué datos se están recuperando
      return {
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
      };
    }
    return { nombre: '', apellido: '' };
  }

  async obtenerDatosUsuario(usuarioId: string): Promise<any> {
    const q = query(this.usuariosCollection, where('uid', '==', usuarioId)); // Cambia a buscar por el campo uid
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log('User Document Exists:', true); // Verifica si el documento existe
      return { id: doc.id, ...doc.data() }; // Retorna los datos del usuario
    } else {
      console.log('User Document Exists:', false); // Verifica si el documento existe
      return null; // Retorna null si no se encuentra el documento
    }
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
}
