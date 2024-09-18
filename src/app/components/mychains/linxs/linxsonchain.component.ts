import { Component, Input, OnInit, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { UtilsService } from '../../../services/utils.service';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { IAccount } from '../../../models/account/IAccount';
import { IUser } from '../../../models/account/IUser';
import { IArticle } from '../../../models/account/IArticle';
import { GroupchatComponent } from '../../chat/groupchat/groupchat.component';
import { IChain } from '../../../models/chain/IChain';
import { ChainInvite } from '../../../models/account/IInteractions';

@Component({
  selector: 'app-linxsonchain',
  standalone: true,
  imports: [GroupchatComponent],
  templateUrl: './linxsonchain.component.html',
  styleUrl: './linxsonchain.component.scss'
})
export class LinxsonchainComponent implements OnInit{
  

  @Input() groupChat! : IGroupChat[];
  @Input() chainInvites! : ChainInvite[];
  @Input() chain! : IChain;
  // @Input()
  // set chain(value: IChainGroup) {
  //   this._chain = value;
  //   this.onChainInputChange();
  // }

  // get chain(): IChainGroup {
  //   return this._chain;
  // }
  @Input() isOpen = signal(false);
  @Input() chainName! : string;
  @Input() chainId! : string;

  // onChainInputChange() {
  //   if (this.isMyChain()) {
  //     this.chain.accounts.forEach(linx => {
  //       if (!this.setBreakAlertOpen[linx.userid]) {
  //         this.setBreakAlertOpen[linx.userid] = false;
  //       }
  //     });
  //   }
  // }

  private signalStorageSvc = inject(SignalStorageService);
  private restsvc = inject(RestnodeService);
  private utilsvc = inject(UtilsService);
  private router = inject(Router);
  public _user! : IUser | null;
  private linxArticles : IArticle[] = [];
  private isChatOpen = signal(false);
  public showBreakChainAlert = signal<{[key : string]: boolean}>({});
  private setBreakAlertOpen : {[key : string]: boolean} = {};
  public groupchat: IGroupChat = {name : '',groupParticipants : [], roomkey : '', messages : [], chainId: ''};  

  @ViewChild('chatContainer', { read: ViewContainerRef, static: true })
  public chatcompoContainer!: ViewContainerRef;

  determineInviteState(linxid : string) : string{
    //"REFUSED" | "ACCEPTED" | "PENDING"
    const state = this.chainInvites.find(inv => inv.to === linxid)?.state
    return state ?? 'PENDING';
  }

  goToLinxProfile(linx : IAccount){
    this.isOpen.set(false);
    this.signalStorageSvc.StoreCandidateData(null); 
    this.signalStorageSvc.StoreLinxData(linx);

    this.router.navigateByUrl(`/Linx/inx/${linx.linxname}`);
  }

  async getWholeProfile(linxid : string){
    try {
      const res = await this.restsvc.getAccountArticles(linxid);
      if(res.code === 0){
        console.log('En LINXSONCHAIN : ', res.message)
        this.linxArticles = res.userdata as IArticle[];
      }else{
        console.log('Error recuperando articulos en LINXSONCHAIN : ', res.error)
      }
    } catch (error) {
      console.log('Error recuperando articulos en LINXSONCHAIN : ', error)
    }
  }

  showAlert(isOpen : boolean, userid : string){
    this.setBreakAlertOpen[userid] = isOpen;
    this.showBreakChainAlert.set(this.setBreakAlertOpen);
  }

  async breakChain(linxid : string){
    try {
      const res = await this.restsvc.breakChain(this._user?.userid! , linxid , this.chainId)
      if(res.code === 0){
      }else{
        
      }
    } catch (error) {
      
    }
  }

  closeModal (){
    this.isOpen.set(false);
  }

  toggleChatModal(){
      this.loadChatComponent()
      this.isChatOpen.update(v => !v);
  }

  async loadChatComponent() {
    const viewContainerRef = this.chatcompoContainer;
    viewContainerRef.clear();
    this.setChat();
    const comporef = viewContainerRef.createComponent<GroupchatComponent>(GroupchatComponent);
    comporef.setInput('isOpen', this.isChatOpen);
    comporef.setInput('groupChatRef', this.groupchat);
  }

  setChat(){
    this.groupchat.name = this.chainName;
    this.groupchat.roomkey = this.chainId;
    this.chain.accounts.forEach(linx => {
      this.groupchat.groupParticipants?.push({userid : linx.userid, linxname : linx.linxname})
    }) 

    const chatIndex = this.groupChat.findIndex(group => group.roomkey === this.chainId)

    if(chatIndex !== -1){
      this.groupChat[chatIndex].messages.forEach(mess => {
        this.groupchat.messages.push(mess)
      })

      this.groupchat.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

  }

  ngOnInit(): void {
    this._user = this.signalStorageSvc.RetrieveUserData()()!;
  }
}
