import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activated-ok',
  standalone: true,
  imports: [],
  templateUrl: './activated-ok.component.html',
  styleUrl: './activated-ok.component.scss'
})
export class ActivatedOkComponent {

  constructor(private router : Router){}

  goToSignin(){
    this.router.navigateByUrl('/Linx/Login');
  }
}
