import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-animation',
  standalone: true,
  imports: [],
  animations: [],
  templateUrl: './animation.component.html',
  styleUrl: './animation.component.css',
})
export class AnimationComponent implements OnInit {
  isLoading = true; // Estado de carga inicial (true significa que se están cargando imágenes)

  images = [
    'https://d6isf1yxni2j5.cloudfront.net/large_videojuegos_2024_34c329fe56.jpg',
    'https://m.media-amazon.com/images/I/71TBfitGpML._SL1500_.jpg',
    'https://i0.wp.com/lavidaesunvideojuego.com/wp-content/uploads/2019/07/Ahora-Super-Mario-Maker-2-permite-subir-el-doble-de-niveles-creados-la_vida_Es_un_videojuego.jpg',
  ];

  ngOnInit() {
    // Método que se ejecuta al inicializar el componente
    this.preloadImages(); // Llama a la función para pre-cargar las imágenes
  }

  preloadImages() {
    // Método para pre-cargar las imágenes
    const imageElements = this.images.map((src) => {
      // Mapea la lista de URLs a elementos de imagen
      const img = new Image(); // Crea un nuevo elemento de imagen
      img.src = src; // Asigna la URL de la imagen al atributo src
      return img; // Retorna el elemento de imagen
    });
    // Espera a que todas las imágenes se carguen usando Promises
    Promise.all(
      imageElements.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.onload = () => resolve(); // Resuelve la promesa cuando la imagen se carga
          })
      )
    ).then(() => {
      // Cuando todas las promesas se resuelven
      this.isLoading = false; // Cambia el estado de carga a false (oculta el loader)
    });
  }
}
