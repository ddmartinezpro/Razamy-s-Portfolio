import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject, portfolioContact, portfolioContent } from '../../data/portfolio-content';
import { PortfolioLanguageService } from '../../services/portfolio-language.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';
import { ExperienceTimelineComponent } from './experience-timeline/experience-timeline.component';

type EmailCopyState = 'idle' | 'copied' | 'failed';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RevealOnScrollDirective, ExperienceTimelineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent {
  private readonly languageService = inject(PortfolioLanguageService);
  private readonly injector = inject(Injector);
  private readonly galleryDialog = viewChild.required<ElementRef<HTMLDialogElement>>('galleryDialog');

  readonly language = this.languageService.language;
  readonly content = computed(() => portfolioContent[this.language()]);
  readonly contact = portfolioContact;
  readonly selectedProject = signal<PortfolioProject | null>(null);
  readonly selectedImage = signal('');
  private readonly maxTiltDeg = 8;
  private tiltRect: DOMRect | null = null;
  private tiltFrame = 0;
  private readonly canHover = window.matchMedia('(hover: hover)');
  readonly openTooltip = signal<string | null>(null);
  readonly tooltipAlignEnd = signal(false);
  readonly emailCopyState = signal<EmailCopyState>('idle');
  private emailCopyTimer: number | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      // Navigating away with the gallery open (e.g. its demo link) must not leave the page scroll locked.
      document.body.classList.remove('modal-open');
      window.clearTimeout(this.emailCopyTimer);
    });
  }

  // `mailto:` does nothing without a configured mail app, so the address can also be copied.
  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.contact.email);
      this.emailCopyState.set('copied');
    } catch {
      this.emailCopyState.set('failed');
    }
    window.clearTimeout(this.emailCopyTimer);
    this.emailCopyTimer = window.setTimeout(() => this.emailCopyState.set('idle'), 2500);
  }

  openProjectGallery(project: PortfolioProject): void {
    this.selectedProject.set(project);
    this.selectedImage.set(project.images[0] ?? project.image);
    document.body.classList.add('modal-open');
    // Open once the content is rendered so the browser can move focus to the close button.
    afterNextRender(() => this.galleryDialog().nativeElement.showModal(), { injector: this.injector });
  }

  // Close button, demo link and backdrop click; Escape closes the <dialog> natively. All paths end in onGalleryClosed().
  closeProjectGallery(): void {
    document.body.classList.remove('modal-open');
    this.galleryDialog().nativeElement.close();
  }

  onGalleryClosed(): void {
    this.selectedProject.set(null);
    this.selectedImage.set('');
    document.body.classList.remove('modal-open');
  }

  // Clicks on the ::backdrop are reported on the <dialog> itself, outside its box.
  @HostListener('click', ['$event'])
  closeOnBackdropClick(event: MouseEvent): void {
    const dialog = this.galleryDialog().nativeElement;
    if (event.target !== dialog || !dialog.open) return;

    const box = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) {
      this.closeProjectGallery();
    }
  }

  selectProjectImage(image: string): void {
    this.selectedImage.set(image);
  }

  // Measure once on enter: measuring the already-tilted card on every move feeds back into the tilt.
  startTilt(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || this.prefersReducedMotion()) return;

    const card = event.currentTarget as HTMLElement;
    this.tiltRect = card.getBoundingClientRect();
    card.classList.add('is-tilting');
  }

  // Tilts the card toward the pointer (at most once per frame); the CSS reads --tilt-x / --tilt-y.
  tiltCard(event: PointerEvent): void {
    const rect = this.tiltRect;
    if (!rect || event.pointerType !== 'mouse') return;

    const card = event.currentTarget as HTMLElement;
    const { clientX, clientY } = event;
    cancelAnimationFrame(this.tiltFrame);
    this.tiltFrame = requestAnimationFrame(() => {
      const x = this.clampUnit((clientX - rect.left) / rect.width - 0.5);
      const y = this.clampUnit((clientY - rect.top) / rect.height - 0.5);
      card.style.setProperty('--tilt-x', `${(-y * this.maxTiltDeg).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * this.maxTiltDeg).toFixed(2)}deg`);
    });
  }

  resetTilt(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    cancelAnimationFrame(this.tiltFrame);
    this.tiltRect = null;
    card.classList.remove('is-tilting');
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  }

  private clampUnit(value: number): number {
    return Math.min(Math.max(value, -0.5), 0.5);
  }

  // Touch devices have no hover: a tap toggles the chip tooltip (only one open at a time).
  toggleTooltip(name: string, event: MouseEvent): void {
    if (!this.canHover.matches) {
      event.stopPropagation();
      if (this.openTooltip() === name) {
        this.openTooltip.set(null);
        return;
      }

      // Chips on the right half open their tooltip towards the left so it stays on screen.
      const chip = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.tooltipAlignEnd.set(chip.left + chip.width / 2 > window.innerWidth / 2);
      this.openTooltip.set(name);
    }
  }

  @HostListener('document:click')
  @HostListener('window:scroll')
  @HostListener('document:keydown.escape')
  closeTooltip(): void {
    if (this.openTooltip()) {
      this.openTooltip.set(null);
    }
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
