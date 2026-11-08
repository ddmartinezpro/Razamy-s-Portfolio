import { Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PortfolioLanguage, portfolioContent } from '../data/portfolio-content';

const STORAGE_KEY = 'portfolio-language';

@Injectable({
  providedIn: 'root',
})
export class PortfolioLanguageService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly languageState = signal<PortfolioLanguage>(this.getInitialLanguage());

  readonly language = this.languageState.asReadonly();

  constructor() {
    // index.html ships the Spanish defaults: sync them right away when the stored language is English.
    this.applyToDocument(this.languageState());
  }

  setLanguage(language: PortfolioLanguage): void {
    this.languageState.set(language);
    localStorage.setItem(STORAGE_KEY, language);
    this.applyToDocument(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.languageState() === 'es' ? 'en' : 'es');
  }

  private applyToDocument(language: PortfolioLanguage): void {
    const { title, description } = portfolioContent[language].meta;
    document.documentElement.lang = language;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }

  private getInitialLanguage(): PortfolioLanguage {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
  }
}
