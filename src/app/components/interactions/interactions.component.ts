import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RestnodeService } from '../../services/restnode.service';
import { SignalStorageService } from '../../services/signal-storage.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { IUser } from '../../models/account/IUser';
import { IAccount } from '../../models/account/IAccount';
import * as interactions from '../../models/account/IInteractions';
import { IChain } from '../../models/chain/IChain';
import { IConnection } from '../../models/account/IConnection';

@Component({
  selector: 'app-interactions',
  standalone: true,
  imports: [],
  templateUrl: './interactions.component.html',
  styleUrl: './interactions.component.scss'
})
export class InteractionsComponent implements OnInit, OnDestroy {

  @Input() interactionsInbox!: Array<interactions.Interaction>;
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

  public currentDate: Date = new Date();

  public openReplyOptions = signal<{ [key: string]: boolean }>({});

  ngOnInit(): void {
    this.websocketsvc.getInteractions().pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        switch (data.type) {
          case 'connection':
            console.log('FULL MATCH :::::::::::::::::', data)
            let tempId = this.utilsvc.generateRoomkey();
            this.websocketsvc.requestInitChat(data.from.userid, this._user?.userid!, tempId);
            let connection: IConnection = { connectedAt: this.currentDate.toISOString(), active: true, roomkey: tempId, account: data.from }
            let newConn = new interactions.NewConnection(tempId, this.currentDate.toISOString(), data.from, this._user?.userid!, false, connection);
            break;
          default:
            break;
        }

      })
  }

  replyToInvite(id: string, accepted: boolean) {
    try {

    } catch (error) {

    }
  }

  toggleReplyOptions(open : boolean , id : string){
    this.openReplyOptions.update((options) => ({
      ...options,
      [id]: open
    })) 
  }

  async removeInteractionFromInbox(interactionId: string) {
    try {

    } catch (error) {

    }
  }

  async emptyInbox() {
    try {

    } catch (error) {

    }
  }

  openChain(chain: IChain) {

  }

  isChainInvite(interaction: interactions.Interaction): interaction is interactions.ChainInvite {
    return interaction.type === 'INVITE';
  }

  isNewConnection(interaction: interactions.Interaction): interaction is interactions.NewConnection {
    return interaction.type === 'CONNECTION';
  }

  goToProfile(account: IAccount) {
    this.signalStorageSvc.StoreLinxData(account);
    this.router.navigateByUrl(`/Linx/perfil/${account.linxname}`)
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
