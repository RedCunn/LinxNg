import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-mainheader',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './mainheader.component.html',
  styleUrl: './mainheader.component.scss'
})
export class MainheaderComponent{
  
  // public routePattern : RegExp = new RegExp("/Linx/Inicio", "g");
  // public switchHome : RegExp = new RegExp("/Linx/Home", "g");
  // private urlsegment : string = 'Home';

  constructor(private router : Router){
  
    // this.router.events.subscribe((event: Event) => {
    //   if (event instanceof NavigationStart) {
    //     if(event.url.match(this.switchHome)){
    //       this.urlsegment = 'Inicio';
    //     }else{
    //       this.urlsegment = 'Home';
    //     }
    //   }
    // })
  }
  goToSignup(){
    this.router.navigateByUrl('/Linx/Registro');
  }

  goToSignin(){
    this.router.navigateByUrl('/Linx/Login');
  }

  goToWelcome(){
    this.router.navigateByUrl('/Linx');
  }


}
