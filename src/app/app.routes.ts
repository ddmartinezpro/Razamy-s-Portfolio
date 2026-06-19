import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'about-me',
    loadComponent: () => import('./components/about-me/about-me.component').then((m) => m.AboutMeComponent)
  },
  {
    path: 'demos',
    loadComponent: () => import('./components/demos/demos.component').then((m) => m.DemosComponent)
  },
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
