import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { initDropdowns, initFlowbite } from 'flowbite';

@Component({
  selector: 'app-homeaside',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './homeaside.component.html',
  styleUrl: './homeaside.component.scss'
})
export class HomeasideComponent implements OnInit{
  

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router : Router) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
      initDropdowns();
    }
  }
  goToEventsPanel(){
    this.router.navigateByUrl("/Linx/Home/Events");
  }

  goToExchangePanel(){
    this.router.navigateByUrl("/Linx/Home/Exchange");
  }
}
