import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ParticleBackgroundComponent } from './components/particle-background/particle-background.component';
import { portfolioContent } from './data/portfolio-content';
import { PortfolioLanguageService } from './services/portfolio-language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ParticleBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  private readonly languageService = inject(PortfolioLanguageService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  readonly skipLabel = computed(() => portfolioContent[this.languageService.language()].nav.skipToContent);

  // Moves keyboard focus past the navigation; preventDefault keeps "#main-content" out of the URL.
  skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
