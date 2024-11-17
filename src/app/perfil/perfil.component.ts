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
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importar las pipes y directivas
import { NombreCompletoPipe } from '../pipes/nombre-completo.pipe';
import { FiltroEspecialidadPipe } from '../pipes/filtro-especialidad.pipe';
import { FormatoFechaPipe } from '../pipes/formato-fecha.pipe';
import { ResaltarDirective } from '../directives/resaltar.directive';
import { CampoObligatorioDirective } from '../directives/campo-obligatorio.directive';
import { MensajeRolDirective } from '../directives/mensaje-rol.directive';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Agrego las pipes y directivas
    NombreCompletoPipe,
    FiltroEspecialidadPipe,
    FormatoFechaPipe,
    ResaltarDirective,
    CampoObligatorioDirective,
    MensajeRolDirective,
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuario: any;
  esEspecialista: boolean = false;
  disponibilidadForm: FormGroup;
  especialidades: string[] = [];

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.disponibilidadForm = this.fb.group({
      especialidades: this.fb.array([]),
    });
  }

  get especialidadArray() {
    return this.disponibilidadForm.get('especialidades') as FormArray;
  }

  async ngOnInit() {
    const authUid = this.authService.getUid();
    if (authUid) {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', authUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        this.usuario = doc.data();
        this.esEspecialista = this.usuario.tipoUsuario === 'Especialista';

        if (this.esEspecialista && this.usuario.especialidad) {
          this.especialidades = this.usuario.especialidad
            .split(', ')
            .map((e: string) => e.trim());
          this.crearFormularioEspecialidades();
        }
      }
    }
  }

  crearFormularioEspecialidades() {
    this.especialidades.forEach((especialidad) => {
      this.especialidadArray.push(
        this.fb.group({
          especialidad: [especialidad],
          lunes: [''],
          martes: [''],
          miercoles: [''],
          jueves: [''],
          viernes: [''],
          sabado: [''],
          domingo: [''],
        })
      );
    });
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
          { disponibilidad: this.disponibilidadForm.value.especialidades },
          { merge: true }
        );
        alert('Disponibilidad horaria guardada.');
      }
    }
  }
}
