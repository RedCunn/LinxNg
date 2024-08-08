import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { LinxsonchainComponent } from '../linxs/linxsonchain.component';
import { IChain } from '../../../models/chain/IChain';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { UtilsService } from '../../../services/utils.service';
import { IUser } from '../../../models/account/IUser';
import { IAccount } from '../../../models/account/IAccount';
import { IGroupChat } from '../../../models/chat/IGroupChat';

@Component({
  selector: 'app-mychain',
  standalone: true,
  imports: [LinxsonchainComponent],
  templateUrl: './mychain.component.html',
  styleUrl: './mychain.component.scss'
})
export class MyChainComponent implements OnInit{

  @Input() isOpen = signal(false);
  @Input() chains ? : Array<IChain>;


  private signalsvc = inject(SignalStorageService)
  private restsvc = inject(RestnodeService)
  private utilsvc = inject(UtilsService);

  public user! : IUser; 
  public isLinxsOnChainOpen = signal(false);
  public chain! : IChain;
  public group : IAccount[] = [];
  public myLinxs : IAccount[] = [];
  public chainName : string = '';
  public chainId! : string;
  public groupChats : IGroupChat[] = [];

  constructor(){
    console.log('CHAINS ON MYCHAINCOMPO : ', this.chains)
  }

  closeModal() {
    this.isOpen.set(false);
  }

  showLinsOnGroup (adgroup : IChain){
    this.chainName = adgroup.chainName;
    this.group = adgroup.accounts;
    this.chainId = adgroup.chainId;
    this.retrieveGroupChat();
    this.isLinxsOnChainOpen.set(true);
  }
  showLinxsOnChain(chain : IChain){
    this.chainName = chain.chainName;
    this.chain = chain;
    this.isLinxsOnChainOpen.set(true);
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
  }

}
