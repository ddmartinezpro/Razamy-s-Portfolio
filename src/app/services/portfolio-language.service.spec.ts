import { TestBed } from '@angular/core/testing';

import { PortfolioLanguageService } from './portfolio-language.service';

const STORAGE_KEY = 'portfolio-language';

describe('PortfolioLanguageService', () => {
  const createService = () => TestBed.inject(PortfolioLanguageService);

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.lang = 'es';
  });

  it('defaults to Spanish when nothing is stored', () => {
    expect(createService().language()).toBe('es');
  });

  it('restores English when it was stored and applies it to the document right away', () => {
    localStorage.setItem(STORAGE_KEY, 'en');

    expect(createService().language()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toContain('Full Stack Developer');
  });

  it('ignores unknown stored values', () => {
    localStorage.setItem(STORAGE_KEY, 'fr');
    expect(createService().language()).toBe('es');
  });

  it('setLanguage updates the signal, <html lang>, title, description and storage', () => {
    const service = createService();

    service.setLanguage('en');

    expect(service.language()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('David Díaz Martínez | Full Stack Developer');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Portfolio of');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('toggleLanguage switches between es and en', () => {
    const service = createService();

    service.toggleLanguage();
    expect(service.language()).toBe('en');

    service.toggleLanguage();
    expect(service.language()).toBe('es');
  });
});
