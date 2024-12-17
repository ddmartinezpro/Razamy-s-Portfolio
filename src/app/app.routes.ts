import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {AboutMeComponent} from './components/about-me/about-me.component';
import {DemosComponent} from './components/demos/demos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-me', component: AboutMeComponent },
  { path: 'demos', component: DemosComponent },
  { path: '*', component: HomeComponent },
];
