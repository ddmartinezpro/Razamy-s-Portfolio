import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  // Eager: it is the landing page, so lazy-loading it only delayed the first paint (LCP) and moved the footer (CLS).
  { path: '', component: HomeComponent },
  {
    path: 'demos/cv-generator',
    loadComponent: () =>
      import('./components/demos/cv-generator/cv-generator.component').then((m) => m.CvGeneratorComponent)
  },
  {
    path: 'demos/ventas',
    loadComponent: () => import('./components/demos/ventas/ventas.component').then((m) => m.VentasComponent)
  },
  { path: '**', redirectTo: '' }
];
