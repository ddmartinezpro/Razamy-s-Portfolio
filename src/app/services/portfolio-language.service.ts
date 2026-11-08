import { Injectable, signal } from '@angular/core';
import { PortfolioLanguage } from '../data/portfolio-content';

@Injectable({
  providedIn: 'root',
})
export class PortfolioLanguageService {
  private readonly languageState = signal<PortfolioLanguage>(this.getInitialLanguage());

  readonly language = this.languageState.asReadonly();

  setLanguage(language: PortfolioLanguage): void {
    this.languageState.set(language);
    document.documentElement.lang = language;
    localStorage.setItem('portfolio-language', language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.languageState() === 'es' ? 'en' : 'es');
  }

  private getInitialLanguage(): PortfolioLanguage {
    const storedLanguage = localStorage.getItem('portfolio-language');
    return storedLanguage === 'en' ? 'en' : 'es';
  }
}
