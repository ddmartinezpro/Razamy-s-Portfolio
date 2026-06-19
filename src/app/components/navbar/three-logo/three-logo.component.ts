import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import gsap from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-three-logo',
  standalone: true,
  templateUrl: './three-logo.component.html',
  styleUrl: './three-logo.component.css'
})
export class ThreeLogoComponent implements AfterViewInit, OnDestroy {
  readonly isDarkMode = signal(false);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  private animationFrameId = 0;
  private model: THREE.Object3D | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private cleanupListeners: Array<() => void> = [];

  ngAfterViewInit(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode.set(prefersDark.matches);
    this.syncBodyTheme();
    this.initThreeJs();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.cleanupListeners.forEach((cleanup) => cleanup());
    this.renderer?.dispose();
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
    this.syncBodyTheme();
    this.animateTheme();
  }

  private initThreeJs(): void {
    const container = this.container().nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();

    scene.add(new THREE.AmbientLight(0x404040, 2));

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    this.directionalLight.position.set(
      this.isDarkMode() ? 2.4 : 9.3,
      this.isDarkMode() ? -5.2 : 2.8,
      this.isDarkMode() ? 5.6 : 6.3
    );
    scene.add(this.directionalLight);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      'assets/models/razamy-logo.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, this.isDarkMode() ? -20 : 0, -80);
        this.model.rotation.set(this.isDarkMode() ? 0.5 : 0, 0.4, 0);
        scene.add(this.model);
        this.addHoverEffect();
        this.startFloatAnimation();
      },
      undefined,
      (error) => console.error('Error loading 3D logo model:', error)
    );

    const handleResize = () => this.resizeRenderer(container);
    window.addEventListener('resize', handleResize);
    this.cleanupListeners.push(() => window.removeEventListener('resize', handleResize));

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      if (this.renderer && this.camera) {
        this.renderer.render(scene, this.camera);
      }
    };
    render();
  }

  private resizeRenderer(container: HTMLElement): void {
    if (!this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private syncBodyTheme(): void {
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  private animateTheme(): void {
    if (this.model) {
      gsap.to(this.model.rotation, {
        x: this.isDarkMode() ? 0.5 : 0,
        y: 0.4,
        z: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }

    if (this.directionalLight) {
      gsap.to(this.directionalLight.position, {
        x: this.isDarkMode() ? 2.4 : 3,
        y: this.isDarkMode() ? -5.2 : 0,
        z: this.isDarkMode() ? 5.6 : 6.3,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  }

  private startFloatAnimation(): void {
    if (!this.model || !this.directionalLight) return;

    gsap.to(this.model.position, {
      y: '-=7',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'sine.inOut'
    });

    gsap.to(this.directionalLight, {
      intensity: 1,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'sine.inOut'
    });
  }

  private addHoverEffect(): void {
    if (!this.model) return;

    const container = this.container().nativeElement;
    const handleMouseEnter = () => {
      if (!this.model) return;
      gsap.to(this.model.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.3,
        ease: 'power1.out'
      });
    };
    const handleMouseLeave = () => {
      if (!this.model) return;
      gsap.to(this.model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power1.in'
      });
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    this.cleanupListeners.push(
      () => container.removeEventListener('mouseenter', handleMouseEnter),
      () => container.removeEventListener('mouseleave', handleMouseLeave)
    );
  }
}
