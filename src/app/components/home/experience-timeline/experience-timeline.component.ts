import { Component, input } from '@angular/core';
import { PortfolioExperience } from '../../../data/portfolio-content';

/** Compact career timeline: one row per role (period · role · company + a single summary line). */
@Component({
  selector: 'app-experience-timeline',
  templateUrl: './experience-timeline.component.html',
  styleUrl: './experience-timeline.component.css',
})
export class ExperienceTimelineComponent {
  readonly items = input.required<PortfolioExperience[]>();
}
