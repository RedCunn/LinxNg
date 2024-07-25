import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID, signal } from '@angular/core';
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
  
  @Input() openArtModal = signal(false);
  @Input() isLinxsOpen = signal(false);

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

  openArticleModal(){
    this.openArtModal.set(true);
  }

  toggleLinxModal() {
    // if(this.isUser()){
    //   this.isMyChain.set(true);
    //   this.isAdminChains.set(false);
    //   this.isSharedChains.set(false);
    // }else{
    //   this.isMyChain.set(false);
    //   this.isAdminChains.set(true);
    // }
    this.isLinxsOpen.update(v => !v);
  }
}
