import { Component } from '@angular/core';
import { ThreeLogoComponent } from './three-logo/three-logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ThreeLogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {}
