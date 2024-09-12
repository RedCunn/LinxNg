import { Component, Input, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { LinxsonchainComponent } from '../linxs/linxsonchain.component';
import { IChain } from '../../../models/chain/IChain';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { UtilsService } from '../../../services/utils.service';
import { IUser } from '../../../models/account/IUser';
import { IAccount } from '../../../models/account/IAccount';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { PickcontactsmodalComponent } from '../contactlist/pickcontactsmodal.component';

@Component({
  selector: 'app-mychain',
  standalone: true,
  imports: [LinxsonchainComponent, PickcontactsmodalComponent],
  templateUrl: './mychain.component.html',
  styleUrl: './mychain.component.scss'
})
export class MyChainComponent implements OnInit{

  @Input() isOpen = signal(false);
  @Input() chains : WritableSignal<IChain[]> = signal([]);

  private signalsvc = inject(SignalStorageService)
  private restsvc = inject(RestnodeService)
  private utilsvc = inject(UtilsService);

  public user! : IUser; 
  public chain! : IChain;
  public group : IAccount[] = [];
  public myLinxs : IAccount[] = [];
  public chainName : string = '';
  public chainId! : string;
  public groupChats : IGroupChat[] = [];

  public showSearchBar = signal(false);
  public searchedChains : WritableSignal<{chainid : string, chainname : string}[]> = signal([]);

  public linxsOnChainOpen = signal(false);
  public contactsOpen = signal(false);


  groupChains(){
        
    //!GROUP --------------- Chains ------> MyChains --/Active
    //!                              \                 \Unactive
    //!                               ----> LinxChains --/Active
    //!                                                  \Unactive

  }

  searchChain(event : any){
    const name = event.target.value.toLowerCase().trim();
  
    if(name.trim() !== ''){
      this.searchedChains.set(this.user.account.chains!.filter(chain => chain.chainname.toLowerCase().includes(name)));
    }else{
      this.searchedChains.set(this.signalsvc.RetrieveUserData()()?.account.chains!);
    }
  }


  isAdmin(chainid : string): boolean{
    const chain = this.chains().find(chain => chain.chainId === chainid);

    const idx = chain?.chainAdminsId.findIndex(id => id === this.user.userid)

    if(idx !== -1){
      return true;
    }else{
      return false;
    } 
  }

  closeModal() {
    this.isOpen.set(false);
  }

  openContactsListModal(){
    this.contactsOpen.set(true);
  }

  showLinsOnGroup (adgroup : IChain){
    this.chainName = adgroup.chainName;
    this.group = adgroup.accounts;
    this.chainId = adgroup.chainId;
    this.retrieveGroupChat();
    this.linxsOnChainOpen.set(true);
  }
  showLinxsOnChain(chainid : string){
    const chain = this.chains().find(chain => chain.chainId === chainid)!;
    this.chainName = chain.chainName;
    this.chain = chain;
    this.linxsOnChainOpen.set(true);
  }

  searchAdminNamesOnMyLinxs (userid : string) : string{
    let adminname = "";

    if(userid === this.user.userid){
      return "";
    }

    const linx = this.myLinxs.find(li => li.userid === userid)

    if(linx){
      adminname = linx?.linxname;
    }

    return adminname;
  }

  async retrieveGroupChat(){
    try {
      const res = await this.restsvc.getChats( this.user?.userid!);
      if(res.code === 0){
        this.groupChats = res.userdata as IGroupChat[];
        console.log('GROUP CHATS ON LINXSONCHAIN : ', this.groupChats)
      }else{
        console.log('ERROR ON RETRIEVING CHATS ON FOOTER ; ', res.error)
      }
     } catch (error) {
      console.log('ERROR ON RETRIEVING CHATS ON FOOTER ; ', error)
     } 
  
  }

  ngOnInit(): void {
    this.user = this.signalsvc.RetrieveUserData()()!;
    this.searchedChains.set(this.user.account.chains!);
  }

}
