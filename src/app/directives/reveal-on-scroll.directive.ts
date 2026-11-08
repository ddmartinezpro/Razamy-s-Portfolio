import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

const VISIBLE_CLASS = 'is-visible';
const STAGGER_MS = 90;
const MAX_STAGGER_MS = 450;

let sharedObserver: IntersectionObserver | null = null;

// Reveals once roughly half of the element is on screen (or it fills half the viewport, for tall ones).
function isHalfVisible(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting || entry.intersectionRect.height === 0) return false;

  const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= viewportHeight * 0.5;
}

function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      // Elements revealed in the same batch enter one after another, top to bottom.
      entries
        .filter(isHalfVisible)
        .map((entry) => entry.target as HTMLElement)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((element, index) => {
          element.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`);
          element.classList.add(VISIBLE_CLASS);
          sharedObserver?.unobserve(element);
        });
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  return sharedObserver;
}

/**
 * Adds `.reveal` to the host and `.is-visible` once it scrolls into view,
 * so the entrance animation plays when the user actually reaches it.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' },
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.element.classList.add(VISIBLE_CLASS);
      return;
    }
    getObserver().observe(this.element);
  }

  ngOnDestroy(): void {
    sharedObserver?.unobserve(this.element);
  }
}
