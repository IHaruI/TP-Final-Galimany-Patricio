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

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  constructor() {}
}
