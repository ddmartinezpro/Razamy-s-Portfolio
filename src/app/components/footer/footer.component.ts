import { Component, computed, inject } from '@angular/core';
import { portfolioContact, portfolioContent } from '../../data/portfolio-content';
import { PortfolioLanguageService } from '../../services/portfolio-language.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: true,
})
export class FooterComponent {
  private readonly languageService = inject(PortfolioLanguageService);

  readonly content = computed(() => portfolioContent[this.languageService.language()]);
  readonly contact = portfolioContact;
}
