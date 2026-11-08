import { Injectable, signal } from '@angular/core';

export type PortfolioTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeState = signal<PortfolioTheme>(this.getInitialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.applyTheme(this.themeState());
    this.watchSystemTheme();
  }

  toggleTheme(): void {
    const nextTheme: PortfolioTheme = this.themeState() === 'dark' ? 'light' : 'dark';
    this.themeState.set(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
    this.applyTheme(nextTheme);
  }

  private getInitialTheme(): PortfolioTheme {
    const storedTheme = localStorage.getItem('portfolio-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (event) => {
      if (localStorage.getItem('portfolio-theme')) return;

      const nextTheme: PortfolioTheme = event.matches ? 'dark' : 'light';
      this.themeState.set(nextTheme);
      this.applyTheme(nextTheme);
    });
  }

  private applyTheme(theme: PortfolioTheme): void {
    document.documentElement.dataset['theme'] = theme;
  }
}
