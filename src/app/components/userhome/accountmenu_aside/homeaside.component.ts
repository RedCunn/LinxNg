import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { initDropdowns, initFlowbite } from 'flowbite';
import { ConnectionsmodalComponent } from './connections/connectionsmodal.component';
import { IConnection } from '../../../models/account/IConnection';
import { IAccount } from '../../../models/account/IAccount';
import { LinxmodalComponent } from './linxs/linxmodal.component';

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
  @Input() userLinxs : IAccount[] = [];
  public openLinxModal = signal(false);
  @Input() userConnections : IConnection[] = [];
  public openConnectionsModal = signal(false);

  @ViewChild('connectionsCompoContainer', { read: ViewContainerRef, static: true })
  public connectionsCompoContainer!: ViewContainerRef;
  @ViewChild('linxsCompoContainer', { read: ViewContainerRef, static: true })
  public linxsCompoContainer!: ViewContainerRef;

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

  loadLinxsComponent(){
    const viewContainerRef = this.linxsCompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<LinxmodalComponent>(LinxmodalComponent);
    comporef.setInput('isOpen', this.openLinxModal);
    comporef.setInput('isMenuOpen', this.isMenuOpen);
    comporef.setInput('linxs', this.userLinxs)
  }

  openLinxs(){
    this.loadLinxsComponent();
    this.isMenuOpen.set(false);
    this.openLinxModal.set(true);
  }

  loadConnectionsComponent() {
    const viewContainerRef = this.connectionsCompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<ConnectionsmodalComponent>(ConnectionsmodalComponent);
    comporef.setInput('isOpen', this.openConnectionsModal);
    comporef.setInput('isMenuOpen', this.isMenuOpen);
    comporef.setInput('connections', this.userConnections)
  }

  openConnections(){
    this.loadConnectionsComponent();
    this.isMenuOpen.set(false);
    this.openConnectionsModal.set(true);
  }

}
