import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'portfolio-theme';

/** Fakes `prefers-color-scheme` so the tests do not depend on the machine running them. */
function mockSystemTheme(prefersDark: boolean): void {
  spyOn(window, 'matchMedia').and.callFake(
    (query: string) =>
      ({
        matches: query.includes('dark') ? prefersDark : false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

describe('ThemeService', () => {
  const createService = () => TestBed.inject(ThemeService);

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    delete document.documentElement.dataset['theme'];
  });

  it('follows the system preference when nothing is stored', () => {
    mockSystemTheme(true);

    const service = createService();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('prefers the stored theme over the system preference', () => {
    mockSystemTheme(true);
    localStorage.setItem(STORAGE_KEY, 'light');

    expect(createService().theme()).toBe('light');
  });

  it('toggleTheme flips the theme, persists it and updates data-theme', () => {
    mockSystemTheme(false);
    const service = createService();

    service.toggleTheme();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
