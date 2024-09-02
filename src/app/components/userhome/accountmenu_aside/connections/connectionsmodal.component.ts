import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
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
  private pongSubscription: Subscription = new Subscription();

  public usersConnectionsState : Map<string, boolean>= new Map();

  ngOnInit(): void {
    const user = this.signalsvc.RetrieveUserData()()!;
    this.socketSvc.pingUsers(user.userid, this.contactsIdsToPing());

    this.pongSubscription = this.socketSvc.userPong().subscribe(userid => {
      this.connections.forEach(conn => {
        const isUserOnline = conn.account.userid === userid;
        console.log('QUIEN ESTA AHI : ', conn.account.linxname + ' isssss : ' + isUserOnline)
        this.usersConnectionsState.set(userid, isUserOnline);
      })
    });

    // const userConnectedSub = this.socketSvc.userConnected$().subscribe((userId: string) => {
    // });
    // const userDisconnectedSub = this.socketSvc.userDisconnected$().subscribe((userId: string) => {
    // });
    // this.subscriptions.add(userConnectedSub);
    // this.subscriptions.add(userDisconnectedSub);
  }
  contactsIdsToPing(): string[] {
    const connections = this.signalsvc.RetrieveConnections()();
    const linxs = this.signalsvc.RetrieveMyLinxs()();

    let ids: string[] = [];

    if (connections) {
      connections?.forEach(conn => {
        ids.push(conn.account.userid);
      })
    }

    if (linxs) {
      linxs?.forEach(linx => {
        ids.push(linx.userid);
      })
    }

    return ids;
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  determineConnectionState(userid: string): WritableSignal<boolean> {
    return this.usersConnectionsState.get(userid) !== undefined ? signal(this.usersConnectionsState.get(userid)!) : signal(false);
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
