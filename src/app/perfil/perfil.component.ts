import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuario: any;
  esEspecialista: boolean = false;
  disponibilidadForm: FormGroup;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.disponibilidadForm = this.fb.group({
      lunes: [''],
      martes: [''],
      miercoles: [''],
      jueves: [''],
      viernes: [''],
      sabado: [''],
      domingo: [''],
    });
  }

  async ngOnInit() {
    const authUid = this.authService.getUid();

    // Crear una consulta en la colección `usuarios` buscando el campo `uid` que coincida con el UID autenticado
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('uid', '==', authUid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      this.usuario = doc.data();
      this.esEspecialista = this.usuario.tipoUsuario === 'Especialista';
    }
  }

  async guardarDisponibilidad() {
    if (this.esEspecialista) {
      const authUid = this.authService.getUid();
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', authUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const usuarioDoc = querySnapshot.docs[0];
        await setDoc(
          usuarioDoc.ref,
          { disponibilidad: this.disponibilidadForm.value },
          { merge: true }
        );
        alert('Disponibilidad horaria guardada.');
      }
    }
  }
}
