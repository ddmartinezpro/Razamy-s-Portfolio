import { Component, input, model } from '@angular/core';

interface CvViewToggleTexts {
  awsFormat: string;
  visualFormat: string;
}

@Component({
  selector: 'app-cv-view-toggle',
  standalone: true,
  templateUrl: './cv-view-toggle.component.html',
  styleUrl: './cv-view-toggle.component.css'
})
export class CvViewToggleComponent {
  readonly texts = input.required<CvViewToggleTexts>();
  readonly isAwsShow = model(false);
}
