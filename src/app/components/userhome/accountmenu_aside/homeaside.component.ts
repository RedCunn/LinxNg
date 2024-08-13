import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { initDropdowns, initFlowbite } from 'flowbite';
import { ConnectionsmodalComponent } from './connections/connectionsmodal.component';
import { IConnection } from '../../../models/account/IConnection';

@Component({
  selector: 'app-homeaside',
  standalone: true,
  imports: [MatIcon, ConnectionsmodalComponent],
  templateUrl: './homeaside.component.html',
  styleUrl: './homeaside.component.scss'
})
export class HomeasideComponent implements OnInit{
  
  public isMenuOpen = signal(true);
  @Input() openArtModal = signal(false);
  @Input() openLinxModal = signal(false);
  @Input() userConnecions : IConnection[] = [];
  public openConnectionsModal = signal(false);

  @ViewChild('connectionsCompoContainer', { read: ViewContainerRef, static: true })
  public connectionsCompoContainer!: ViewContainerRef;

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

  loadConnectionsComponent() {
    const viewContainerRef = this.connectionsCompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<ConnectionsmodalComponent>(ConnectionsmodalComponent);
    comporef.setInput('isOpen', this.openConnectionsModal);
    comporef.setInput('isMenuOpen', this.isMenuOpen);
    comporef.setInput('connections', this.userConnecions)
  }

  openConnections(){
    this.loadConnectionsComponent();
    this.isMenuOpen.set(false);
    this.openConnectionsModal.set(true);
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
    this.openLinxModal.update(v => !v);
  }
}
