import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...appConfig.providers,
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyDu6z3W7GTVBaGY8WloALcRCI3Dq5CYp-8',
        authDomain: 'la-clinica-online.firebaseapp.com',
        projectId: 'la-clinica-online',
        storageBucket: 'la-clinica-online.appspot.com',
        messagingSenderId: '223153939731',
        appId: '1:223153939731:web:3a58cec41c25601d34e6e6',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
}).catch((err) => console.error(err));
