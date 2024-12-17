import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RouterLink} from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('razamyLogoContainer', {static: true}) threejsContainer!: ElementRef;

  isDarkMode = false;
  private model: THREE.Object3D | null = null;
  private directionalLight!: THREE.DirectionalLight;

  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = !prefersDark.matches;
    this.toggleTheme(false); // Configura el estado inicial sin animación
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  initThreeJS(): void {
    const container = document.getElementById('razamy-logo-container')!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Luz direccional
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    if (this.isDarkMode) {
      this.directionalLight.position.set(2.4, -5.2, 5.6);
    } else {
      this.directionalLight.position.set(9.3, 2.8, 6.3);
    }
    scene.add(this.directionalLight);

    // Cargar el modelo
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/razamy-logo.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, -20, -80);
        this.model.rotation.set(this.isDarkMode ? 0.5 : 0, 0.5, 0);

        this.addHoverEffect();      // Efecto hover
        this.startFloatAnimation(); // Animación continua

        scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo:', error);
      }
    );

    // Configurar la cámara
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    camera.position.set(0, 0, 5);

    // Renderizador
    const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(5);
    container.appendChild(renderer.domElement);

    // Actualizar el tamaño de la cámara cuando se redimensiona la ventana
    window.addEventListener('resize', () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // Animar el renderizado
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }

  toggleTheme(animate = true) {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }

    // Aplicar la animación al modelo
    if (this.model) {
      if (animate) {
        gsap.to(this.model.rotation, {
          x: this.isDarkMode ? 0.5 : 0, // Rotación en X (tema claro/oscuro)
          y: 0.4,  // Rotación en Y
          z: 0,    // Rotación constante en Z
          duration: 0.3,
          ease: 'power2.inOut',
        });

      } else {
        // Configuración inicial sin animación
        this.model.rotation.set(this.isDarkMode ? 0.5 : 0, 0.4, 0);
        this.model.position.set(0, this.isDarkMode ? -20 : 0, -80);
      }
    }


    // Animar la posición de la luz direccional
    if (this.directionalLight) {
      gsap.to(this.directionalLight.position, {
        x: this.isDarkMode ? 2.4 : 3,  // Cambiar posición en X
        y: this.isDarkMode ? -5.2 : 0, // Cambiar posición en Y
        z: this.isDarkMode ? 5.6 : 6.3, // Cambiar posición en Z
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  }

  // Animación continua del modelo (ligera variación de posición y luz)
  startFloatAnimation(): void {
    if (this.model && this.directionalLight) {
      gsap.to(this.model.position, {
        y: "-=7", // Subir ligeramente
        repeat: -1, // Repetir infinitamente
        yoyo: true, // Volver a la posición inicial
        duration: 1.5,
        ease: "sine.inOut"
      });

      gsap.to(this.directionalLight, {
        intensity: 1, // Incrementar intensidad
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "sine.inOut"
      });
    }
  }

  // Efecto hover en el modelo
  addHoverEffect(): void {
    if (!this.model) return;

    const container = this.threejsContainer.nativeElement;

    container.addEventListener('mouseenter', () => {
      gsap.to(this.model!.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.3,
        ease: 'power1.out'
      });
    });

    container.addEventListener('mouseleave', () => {
      gsap.to(this.model!.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power1.in'
      });
    });
  }
}
