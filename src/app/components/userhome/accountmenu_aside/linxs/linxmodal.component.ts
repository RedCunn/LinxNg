import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { SignalStorageService } from '../../../../services/signal-storage.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { IAccount } from '../../../../models/account/IAccount';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-linxmodal',
  standalone: true,
  imports: [],
  templateUrl: './linxmodal.component.html',
  styleUrl: './linxmodal.component.scss'
})
export class LinxmodalComponent implements OnDestroy, OnInit {

  private router = inject(Router);
  private signalsvc = inject(SignalStorageService);
  private socketSvc = inject(WebsocketService);

  @Input() isOpen = signal(false);
  @Input() isMenuOpen = signal(true);
  @Input() linxs: IAccount[] = [];

  public contacts : WritableSignal<IAccount[]> = signal([]);
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

  searchContact(event : any){
    const name = event.target.value.toLowerCase().trim();

    if(name.trim() !== ''){
      this.contacts.update(current => {
        return current.filter(contact => 
          contact.linxname.toLowerCase().includes(name)
        );
      })
    }else{
      this.loadContacts()
    }
  }
 
  loadContacts(){

    this.contacts.set([]);

    const connections = this.linxs;

    if(connections){
      connections.forEach(conn => {
        this.contacts.update( cons => [...cons, conn])
      })
    }

    this.contacts.update(current => {
      return [...current].sort((a, b) => a.linxname.localeCompare(b.linxname));
    })
  }

  determineState(userid : string) : boolean{
    const userState = this.usersConnectionsState.find(u => u.userid === userid)?.isOnline;
    return userState !== undefined ? userState : false;
  }

  updateConnectionState(userid : string, isConnected : boolean){
    const connection = this.linxs.find(conn => conn.userid === userid);

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

  ngOnInit() : void {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.pongSubscription.unsubscribe();
  }


}
