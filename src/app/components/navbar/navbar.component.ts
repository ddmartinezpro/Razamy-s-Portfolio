import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  afterNextRender,
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

type SectionId = 'home' | 'stack' | 'experience' | 'projects' | 'services' | 'contact';
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
  private readonly injector = inject(Injector);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');
  private readonly mobileMenuQuery = window.matchMedia(MOBILE_MENU_QUERY);
  private readonly sectionIds: SectionId[] = ['home', 'stack', 'experience', 'projects', 'services', 'contact'];
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
  readonly sectionLinks: SectionLink[] = ['stack', 'experience', 'projects', 'services', 'contact'];

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
    // Router links with a section fragment (e.g. the demos' "back to portfolio" → /#projects) scroll once the
    // lazy home has rendered; the router's own anchorScrolling fires too early for that.
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        window.setTimeout(() => this.initSectionObserver(), 120);

        const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment as SectionId | null;
        if (fragment && fragment !== 'home' && this.sectionIds.includes(fragment)) {
          this.scrollToSectionWhenRendered(fragment);
        }
      });
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
    if (open) {
      // The menu is `inert` until this render removes the attribute: focus its first link afterwards.
      afterNextRender(() => this.menuFocusables()[1]?.focus(), { injector: this.injector });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  // While the mobile menu is open, Tab / Shift+Tab cycle through the menu button and the menu items only.
  @HostListener('document:keydown', ['$event'])
  trapMenuFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.menuOpen()) return;

    const items = this.menuFocusables();
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const insideMenu = active !== null && items.includes(active);

    if (event.shiftKey && (active === first || !insideMenu)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !insideMenu)) {
      event.preventDefault();
      first.focus();
    }
  }

  /** Menu toggle button first, then every focusable item of the mobile menu, in DOM order. */
  private menuFocusables(): HTMLElement[] {
    const button = this.menuButton()?.nativeElement;
    const menu = this.mobileMenu()?.nativeElement;
    const inMenu = menu ? Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : [];
    return button ? [button, ...inMenu] : inMenu;
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

  // A shared link like `/#contact` lands on that section; otherwise a reload starts at the top.
  // Either way the URL is left clean (section links never write a hash either).
  private handleInitialPosition(): void {
    const target = window.location.hash.slice(1) as SectionId;
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (target && target !== 'home' && this.sectionIds.includes(target)) {
      this.scrollToSectionWhenRendered(target);
      return;
    }

    // 'instant' bypasses the global `scroll-behavior: smooth`.
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.activeSection.set('home');
  }

  // The home route is lazy-loaded: wait (up to ~2s) for the section to exist before jumping to it.
  private scrollToSectionWhenRendered(sectionId: SectionId, attemptsLeft = 40): void {
    if (!document.getElementById(sectionId)) {
      if (attemptsLeft > 0) {
        window.setTimeout(() => this.scrollToSectionWhenRendered(sectionId, attemptsLeft - 1), 50);
      }
      return;
    }

    this.activateAndLockSection(sectionId);

    // Content above the section keeps growing for a few frames after it first exists (fonts, nested
    // components), which would leave the jump short: re-align a few times unless the user starts scrolling.
    let userMoved = false;
    const markMoved = (): void => {
      userMoved = true;
    };
    this.userScrollEvents.forEach((type) => window.addEventListener(type, markMoved, { passive: true, once: true }));
    [0, 120, 300, 600].forEach((delay) =>
      window.setTimeout(() => {
        if (!userMoved) this.scrollToSection(sectionId, 'instant');
      }, delay),
    );
    window.setTimeout(
      () => this.userScrollEvents.forEach((type) => window.removeEventListener(type, markMoved)),
      700,
    );
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
