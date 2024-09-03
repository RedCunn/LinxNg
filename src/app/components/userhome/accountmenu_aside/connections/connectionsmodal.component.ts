import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
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
export class ConnectionsmodalComponent implements OnDestroy {

  private router = inject(Router);
  private signalsvc = inject(SignalStorageService);
  private socketSvc = inject(WebsocketService);

  @Input() isOpen = signal(false);
  @Input() isMenuOpen = signal(true);
  @Input() connections: IConnection[] = [];

  private pongSubscription: Subscription = new Subscription();

  public usersConnectionsState: { userid: string; isOnline: boolean }[] = [];

  constructor(private cdr : ChangeDetectorRef){
    const user = this.signalsvc.RetrieveUserData()()!;
    this.socketSvc.pingUsers(user.userid, this.contactsIdsToPing());

    this.pongSubscription = this.socketSvc.userPong()
                                          .subscribe(userid => {
                                            this.updateConnectionState(userid, true);
                                            this.cdr.detectChanges();
                                          });

  }

  determineState(userid : string) : boolean{
    const userState = this.usersConnectionsState.find(u => u.userid === userid)?.isOnline;
    return userState !== undefined ? userState : false;
  }

  updateConnectionState(userid : string, isConnected : boolean){
    const connection = this.connections.find(conn => conn.account.userid === userid);

    if(connection){
      const userState = this.usersConnectionsState.find(u => u.userid === userid);
      if (userState) {
        userState.isOnline = isConnected;
      } else {
        this.usersConnectionsState.push({ userid, isOnline: isConnected});
      }
    }else{
      this.usersConnectionsState.push({ userid, isOnline: false });
    }
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
  closeModal() {
    this.isOpen.set(false);
    this.isMenuOpen.set(true);
  }

  goToConnectionProfile(account: IAccount) {
    this.signalsvc.StoreLinxData(account);
    console.log('SAVING ACCOUNT connected : ', this.signalsvc.RetrieveLinxData()());
    this.router.navigateByUrl(`Linx/conecta/${account.linxname}`)
  }
  ngOnDestroy(): void {
    this.pongSubscription.unsubscribe();
  }


}
