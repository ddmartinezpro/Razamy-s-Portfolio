import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

@Component({
  selector: 'app-particle-background',
  standalone: true,
  templateUrl: './particle-background.component.html',
  styleUrl: './particle-background.component.css',
})
export class ParticleBackgroundComponent implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly particles: Particle[] = [];
  private animationFrame = 0;
  private context: CanvasRenderingContext2D | null = null;
  private mouse = { x: -9999, y: -9999 };
  private cleanupListeners: (() => void)[] = [];
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly smallScreenWidth = 760;
  private particleColor = 'rgba(80, 115, 148, 0.38)';
  private lineColor = 'rgba(80, 115, 148, 0.12)';
  private viewportWidth = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvas().nativeElement;
    this.context = canvas.getContext('2d');
    if (!this.context) return;

    this.readColors();
    this.resize();
    this.seedParticles();
    this.bindEvents();
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
    this.cleanupListeners.forEach((cleanup) => cleanup());
  }

  private start(): void {
    if (!this.animationFrame) {
      this.render();
    }
  }

  private stop(): void {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
  }

  // Colors come from theme tokens; read them once per theme change instead of every frame.
  private readColors(): void {
    const styles = getComputedStyle(document.documentElement);
    this.particleColor = styles.getPropertyValue('--particle-color').trim() || this.particleColor;
    this.lineColor = styles.getPropertyValue('--particle-line').trim() || this.lineColor;
  }

  private bindEvents(): void {
    // Mobile URL bars change only the height while scrolling: rescale without reseeding.
    const resizeHandler = () => {
      const widthChanged = window.innerWidth !== this.viewportWidth;
      this.resize();
      if (widthChanged) {
        this.seedParticles();
      }
    };
    // Pause the loop while the tab is hidden to save battery.
    const visibilityHandler = () => (document.hidden ? this.stop() : this.start());
    const themeObserver = new MutationObserver(() => this.readColors());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mouseMoveHandler = (event: MouseEvent) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    };
    const mouseLeaveHandler = () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    window.addEventListener('resize', resizeHandler);
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseleave', mouseLeaveHandler);
    this.cleanupListeners.push(
      () => window.removeEventListener('resize', resizeHandler),
      () => document.removeEventListener('visibilitychange', visibilityHandler),
      () => themeObserver.disconnect(),
      () => window.removeEventListener('mousemove', mouseMoveHandler),
      () => window.removeEventListener('mouseleave', mouseLeaveHandler)
    );
  }

  private resize(): void {
    const canvas = this.canvas().nativeElement;
    const isSmallScreen = window.innerWidth < this.smallScreenWidth;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2);
    this.viewportWidth = window.innerWidth;
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  private seedParticles(): void {
    this.particles.length = 0;
    const baseCount = window.innerWidth < this.smallScreenWidth ? 18 : 54;
    const count = this.reducedMotion ? Math.floor(baseCount * 0.35) : baseCount;

    for (let index = 0; index < count; index++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.7 + 0.7,
      });
    }
  }

  private render(): void {
    if (!this.context) return;

    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.drawParticles();
    this.drawConnections();

    this.animationFrame = requestAnimationFrame(() => this.render());
  }

  private drawParticles(): void {
    if (!this.context) return;
    this.context.fillStyle = this.particleColor;

    for (const particle of this.particles) {
      if (!this.reducedMotion) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.hypot(dx, dy);
        const push = distance < 120 ? (120 - distance) / 120 : 0;

        particle.x += particle.vx + dx * push * 0.012;
        particle.y += particle.vy + dy * push * 0.012;
      }

      if (particle.x < -10) particle.x = window.innerWidth + 10;
      if (particle.x > window.innerWidth + 10) particle.x = -10;
      if (particle.y < -10) particle.y = window.innerHeight + 10;
      if (particle.y > window.innerHeight + 10) particle.y = -10;

      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawConnections(): void {
    if (!this.context) return;
    this.context.strokeStyle = this.lineColor;
    this.context.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const first = this.particles[i];
        const second = this.particles[j];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);

        if (distance > 130) continue;

        this.context.globalAlpha = (130 - distance) / 130;
        this.context.beginPath();
        this.context.moveTo(first.x, first.y);
        this.context.lineTo(second.x, second.y);
        this.context.stroke();
      }
    }

    this.context.globalAlpha = 1;
  }
}
