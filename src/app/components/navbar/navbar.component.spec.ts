import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let element: HTMLElement;

  const menuButton = () => element.querySelector<HTMLButtonElement>('.menu-toggle')!;
  const mobileMenu = () => element.querySelector<HTMLElement>('#mobile-menu')!;

  beforeEach(async () => {
    localStorage.removeItem('portfolio-language');

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('portfolio-language');
    document.documentElement.lang = 'es';
  });

  it('starts with the mobile menu closed', () => {
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(mobileMenu().classList).not.toContain('is-open');
  });

  it('opens the mobile menu and locks the page scroll', () => {
    menuButton().click();
    fixture.detectChanges();

    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu().classList).toContain('is-open');
    expect(document.body.classList).toContain('menu-open');
  });

  it('closes the mobile menu with Escape', () => {
    menuButton().click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.body.classList).not.toContain('menu-open');
  });

  it('translates the section links when the language changes', () => {
    const linkTexts = () =>
      Array.from(element.querySelectorAll('.nav-links a')).map((link) => link.textContent?.trim());

    expect(linkTexts()).toContain('Proyectos');

    fixture.componentInstance.setLanguage('en');
    fixture.detectChanges();

    expect(linkTexts()).toContain('Projects');
    expect(linkTexts()).not.toContain('Proyectos');
  });
});
