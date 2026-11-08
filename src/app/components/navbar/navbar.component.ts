import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { PortfolioLanguage, portfolioContent } from '../../data/portfolio-content';
import { PortfolioLanguageService } from '../../services/portfolio-language.service';
import { PortfolioTheme, ThemeService } from '../../services/theme.service';

type SectionId = 'home' | 'stack' | 'projects' | 'services' | 'contact';
type SectionLink = Exclude<SectionId, 'home'>;

const MOBILE_MENU_QUERY = '(max-width: 920px)';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  private readonly languageService = inject(PortfolioLanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileMenuQuery = window.matchMedia(MOBILE_MENU_QUERY);
  private readonly sectionIds: SectionId[] = ['home', 'stack', 'projects', 'services', 'contact'];
  private routerSubscription: Subscription | null = null;
  private readonly userScrollEvents = ['wheel', 'touchstart', 'keydown'] as const;
  private observer: IntersectionObserver | null = null;
  private pendingSection: SectionId | null = null;
  private scrollIdleTimer: number | undefined;
  private scrollSafetyTimer: number | undefined;

  readonly language = this.languageService.language;
  readonly theme = this.themeService.theme;
  readonly content = computed(() => portfolioContent[this.language()].nav);
  readonly activeSection = signal<SectionId>('home');
  readonly menuOpen = signal(false);
  readonly sectionLinks: SectionLink[] = ['stack', 'projects', 'services', 'contact'];

  constructor() {
    // Prevent the browser from restoring the previous scroll position on reload.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => this.initSectionObserver(), 120);
    window.setTimeout(() => this.handleInitialPosition(), 160);
    document.addEventListener('click', this.onDocumentAnchorClick);
    this.mobileMenuQuery.addEventListener('change', this.onMobileQueryChange);

    // Sections only exist on the home route: re-attach the observer whenever we land there.
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => window.setTimeout(() => this.initSectionObserver(), 120));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    document.removeEventListener('click', this.onDocumentAnchorClick);
    this.mobileMenuQuery.removeEventListener('change', this.onMobileQueryChange);
    this.routerSubscription?.unsubscribe();
    this.releasePendingSection();
    document.body.classList.remove('menu-open');
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  setLanguage(language: PortfolioLanguage): void {
    this.languageService.setLanguage(language);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  selectTheme(theme: PortfolioTheme): void {
    if (this.theme() !== theme) {
      this.themeService.toggleTheme();
    }
  }

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.setMenuOpen(true);
    }
  }

  closeMenu(restoreFocus = true): void {
    if (!this.menuOpen()) return;

    this.setMenuOpen(false);
    if (restoreFocus) {
      this.menuButton()?.nativeElement.focus();
    }
  }

  // The body scroll lock is toggled synchronously: a section scroll right after closing
  // must not run while the body is still `overflow: hidden`.
  private setMenuOpen(open: boolean): void {
    this.menuOpen.set(open);
    document.body.classList.toggle('menu-open', open);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  navigateToSection(sectionId: SectionId, event: MouseEvent): void {
    event.preventDefault();
    this.closeMenu(false);

    // From other routes (e.g. demos) go back home first, then scroll once the sections are rendered.
    if (this.router.url.split(/[?#]/)[0] !== '/') {
      this.activeSection.set(sectionId);
      void this.router.navigateByUrl('/').then(() => {
        window.setTimeout(() => {
          this.activateAndLockSection(sectionId);
          // 'instant' bypasses the global smooth scroll: jump straight to the section on arrival.
          this.scrollToSection(sectionId, 'instant');
        }, 80);
      });
      return;
    }

    this.activateAndLockSection(sectionId);
    this.scrollToSection(sectionId);
  }

  private readonly onMobileQueryChange = (event: MediaQueryListEvent): void => {
    if (!event.matches) {
      this.closeMenu(false);
    }
  };

  // Anchors outside the navbar (e.g. hero CTAs) get the same smooth navigation without flicker.
  private readonly onDocumentAnchorClick = (event: MouseEvent): void => {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor || anchor.closest('app-navbar')) return;

    const sectionId = anchor.getAttribute('href')!.slice(1) as SectionId;
    if (!this.sectionIds.includes(sectionId)) return;

    event.preventDefault();
    this.activateAndLockSection(sectionId);
    this.scrollToSection(sectionId);
  };

  // Highlights the target link right away, then freezes it while smooth-scrolling
  // so intermediate sections never get highlighted.
  private activateAndLockSection(sectionId: SectionId): void {
    this.releasePendingSection();
    this.activeSection.set(sectionId);
    this.pendingSection = sectionId;

    window.addEventListener('scroll', this.onLockedScroll, { passive: true });
    this.userScrollEvents.forEach((type) =>
      window.addEventListener(type, this.onUserScrollIntent, { passive: true })
    );
    this.scrollIdleTimer = window.setTimeout(this.onScrollArrived, 150);
    this.scrollSafetyTimer = window.setTimeout(this.onScrollArrived, 2000);
  }

  private readonly onLockedScroll = (): void => {
    window.clearTimeout(this.scrollIdleTimer);
    this.scrollIdleTimer = window.setTimeout(this.onScrollArrived, 120);
  };

  private readonly onScrollArrived = (): void => {
    if (this.pendingSection) {
      this.activeSection.set(this.pendingSection);
    }
    this.releasePendingSection();
  };

  private readonly onUserScrollIntent = (): void => {
    this.releasePendingSection();
  };

  private releasePendingSection(): void {
    this.pendingSection = null;
    window.clearTimeout(this.scrollIdleTimer);
    window.clearTimeout(this.scrollSafetyTimer);
    window.removeEventListener('scroll', this.onLockedScroll);
    this.userScrollEvents.forEach((type) => window.removeEventListener(type, this.onUserScrollIntent));
  }

  private initSectionObserver(): void {
    const sections = this.sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.pendingSection) return;

        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          this.activeSection.set(visibleEntry.target.id as SectionId);
        }
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0.08, 0.2, 0.45],
      }
    );

    sections.forEach((section) => this.observer?.observe(section));
  }

  // A reload always starts at the top with a clean URL (no section hash).
  private handleInitialPosition(): void {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // 'instant' bypasses the global `scroll-behavior: smooth`.
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.activeSection.set('home');
  }

  private scrollToSection(sectionId: SectionId, behavior: ScrollBehavior = 'smooth'): void {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Each section defines its own anchor offset via scroll-margin-top (contact snaps flush to the top).
    const scrollMargin = Number.parseInt(getComputedStyle(section).scrollMarginTop, 10);
    const offset = Number.isNaN(scrollMargin) ? 132 : scrollMargin;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top =
      sectionId === 'home'
        ? 0
        : Math.max(section.getBoundingClientRect().top + window.scrollY - offset, 0);

    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : behavior });
  }
}
