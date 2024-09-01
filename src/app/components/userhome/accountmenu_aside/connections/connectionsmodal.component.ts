import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { IConnection } from '../../../../models/account/IConnection';
import { Router } from '@angular/router';
import { IAccount } from '../../../../models/account/IAccount';
import { SignalStorageService } from '../../../../services/signal-storage.service';
import { Subject, Subscription } from 'rxjs';
import { WebsocketService } from '../../../../services/websocket.service';

@Component({
  selector: 'app-connectionsmodal',
  standalone: true,
  imports: [],
  templateUrl: './connectionsmodal.component.html',
  styleUrl: './connectionsmodal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionsmodalComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private signalsvc = inject(SignalStorageService);
  private socketSvc = inject(WebsocketService);

  @Input() isOpen = signal(false);
  @Input() isMenuOpen = signal(true);
  @Input() connections: IConnection[] = [];

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {

    

    const userConnectedSub = this.socketSvc.userConnected$().subscribe((userId: string) => {


    });

    const userDisconnectedSub = this.socketSvc.userDisconnected$().subscribe((userId: string) => {


    });
    this.subscriptions.add(userConnectedSub);
    this.subscriptions.add(userDisconnectedSub);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  determineConnectionState(userid: string): boolean {
    return true;
  }

  closeModal() {
    this.isOpen.set(false);
    this.isMenuOpen.set(true);
  }

  goToConnectionProfile(account: IAccount) {
    this.signalsvc.StoreLinxData(account);
    console.log('SAVING ACCOUNT connected : ', this.signalsvc.RetrieveLinxData()());
    this.router.navigateByUrl(`Linx/conecta/${account.linxname}`)
  }
}
