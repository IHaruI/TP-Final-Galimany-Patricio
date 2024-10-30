import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
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

  // Método para registrar un nuevo usuario en Firebase Authentication y Firestore
  // Método para registrar un nuevo usuario en Firebase Authentication y Firestore
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
      return userCredential; // Cambia esto a UserCredential
    } catch (error) {
      console.error(
        'Error al registrar usuario en Firebase Authentication:',
        error
      );
      throw error;
    }
  }

  // Método para iniciar sesión
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

  // Método para obtener un usuario de Firestore por su email
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
