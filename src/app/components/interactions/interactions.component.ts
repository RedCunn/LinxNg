import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RestnodeService } from '../../services/restnode.service';
import { SignalStorageService } from '../../services/signal-storage.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { IUser } from '../../models/account/IUser';
import { IAccount } from '../../models/account/IAccount';
import { IArticle } from '../../models/account/IArticle';
import * as interactions from '../../models/account/IInteractions';
import { IChain } from '../../models/chain/IChain';

@Component({
  selector: 'app-interactions',
  standalone: true,
  imports: [],
  templateUrl: './interactions.component.html',
  styleUrl: './interactions.component.scss'
})
export class InteractionsComponent implements OnInit, OnDestroy {
  

  @Input() isOpen = signal(false)

  closeModal() {
    this.isOpen.set(false);
  }

  private restSvc = inject(RestnodeService);
  private signalStorageSvc = inject(SignalStorageService);
  private websocketsvc = inject(WebsocketService);
  private utilsvc = inject(UtilsService);
  private router = inject(Router);

  public _user!: IUser | null;
  private destroy$ = new Subject<void>();

  public chainInvites: Array<interactions.IChainInvite> = [];
  public newsOnChain : Array<interactions.INewOnChain> = [];
  public newConnections : Array<interactions.INewConnection> = [];
  public usersOffChain : Array<interactions.IUserOffChain> = [];

  public interactionsInbox : Array <interactions.Interaction> = [];

  public currentDate : Date = new Date();


  async removeInteractionFromInbox(interactionId : string){
    try {
      
    } catch (error) {
      
    }
  }

  async emptyInbox(){
    try {
      
    } catch (error) {
      
    }
  }

  openChain(chain : IChain){
    
  }

  goToProfile(account : IAccount){
    this.signalStorageSvc.StoreLinxData(account);
    this.router.navigateByUrl(`/Linx/profile/${account.linxname}`)
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
  

}
