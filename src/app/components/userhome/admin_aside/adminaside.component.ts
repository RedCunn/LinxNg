import { Component, inject } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adminaside',
  standalone: true,
  imports: [],
  templateUrl: './adminaside.component.html',
  styleUrl: './adminaside.component.scss'
})
export class AdminasideComponent {

  private socketsvc: WebsocketService = inject(WebsocketService);
  private signalStoreSvc: SignalStorageService = inject(SignalStorageService);
  private router : Router = inject(Router);
  
  logout() {
    this.signalStoreSvc.StoreUserData(null);
    this.signalStoreSvc.StoreJWT(null);
    this.signalStoreSvc.StoreRoomKeys(null);
    this.signalStoreSvc.StoreMatchesAccounts(null);
    this.signalStoreSvc.StoreMyLinxs(null);
    this.signalStoreSvc.StoreGroupedLinxsOnMyChains(null);
    this.signalStoreSvc.StoreMatches(null);
    this.signalStoreSvc.StoreCandidateData(null);
    this.socketsvc.disconnect();
    this.router.navigateByUrl('/Linx/Login');
  }
}
