import { Component, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-welcomefooter',
  standalone: true,
  imports: [],
  templateUrl: './welcomefooter.component.html',
  styleUrl: './welcomefooter.component.scss'
})
export class WelcomefooterComponent {
  
  public isWelcome = signal(false);
  private welcomeRoutePattern: RegExp = new RegExp("^/Linx$", "g");

  constructor(private router : Router){

    this.router.events
    .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        map(url => {
              if (this.welcomeRoutePattern.test(url)) {
                this.isWelcome.set(true);
              }else{
                this.isWelcome.set(false);
              }
            }
          )
        )
        .subscribe();
  }

  goToLogin(){
    this.router.navigateByUrl(`/Linx/Login`);
  }
}
