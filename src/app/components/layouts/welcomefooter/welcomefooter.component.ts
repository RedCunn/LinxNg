import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcomefooter',
  standalone: true,
  imports: [],
  templateUrl: './welcomefooter.component.html',
  styleUrl: './welcomefooter.component.scss'
})
export class WelcomefooterComponent {
  constructor(private router : Router){}
  goToLogin(){
    this.router.navigateByUrl(`/Linx/Login`);
  }
}
