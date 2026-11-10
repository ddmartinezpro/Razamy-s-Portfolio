import { Component, input, model } from '@angular/core';
import { CvFormat } from './data/cv.model';

interface CvViewToggleTexts {
  format: string;
  awsFormat: string;
  visualFormat: string;
}

/** Radio group to pick the CV design (one choice out of two, keyboard-operable with the arrow keys). */
@Component({
  selector: 'app-cv-view-toggle',
  standalone: true,
  templateUrl: './cv-view-toggle.component.html',
  styleUrl: './cv-view-toggle.component.css',
})
export class CvViewToggleComponent {
  readonly texts = input.required<CvViewToggleTexts>();
  readonly format = model<CvFormat>('visual');
}
