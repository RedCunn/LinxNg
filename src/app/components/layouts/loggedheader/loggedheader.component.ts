import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { Router } from '@angular/router';
import { IUser } from '../../../models/account/IUser';
import { MyChainComponent } from '../../mychains/chain/mychain.component';
import { IChain } from '../../../models/chain/IChain';
import { RestnodeService } from '../../../services/restnode.service';

@Component({
  selector: 'app-loggedheader',
  standalone: true,
  imports: [MyChainComponent],
  templateUrl: './loggedheader.component.html',
  styleUrl: './loggedheader.component.scss'
})
export class LoggedheaderComponent implements OnInit{
  
  private signalStoreSvc : SignalStorageService = inject(SignalStorageService);
  private restSvc : RestnodeService = inject(RestnodeService);

  public isMyChainOpen = signal(false);
  public isMyChain = signal(false);
  public isSharedChain = signal(false);
  public isAllChains = signal(true);
  private user! : IUser;
  public allChains : WritableSignal<IChain[]> = signal([]);
  
  constructor(private router : Router){
    this.user = this.signalStoreSvc.RetrieveUserData()()!;
  }

  async retrieveChains (){
    try {
      let  chainids : string [] = [];

      this.user.account.chains?.forEach(chain => {
        chainids.push(chain.chainid);
      })

      const res = await this.restSvc.getChains(chainids);

      if(res.code === 0){
        this.allChains.set(res.userdata);
      }else{
        console.log('ERROR RETRIEVING CHAINS AT LOGGEDHEADER : ', res.error)
      }

    } catch (error) {
      console.log('ERROR RETRIEVING CHAINS AT LOGGEDHEADER : ', error)
    }
  }

  ngOnInit(): void {

    if(this.user.account.chains && this.user.account.chains.length > 0){
      this.retrieveChains();
    }
    
  }

  goInit(){
    this.router.navigateByUrl(`/Linx/Inicio`);
  }
  goHome(){
    this.router.navigateByUrl(`/Linx/cuenta`);
  }

  toggleMyChainModal() {
    this.isMyChainOpen.update(v => !v);
  }

}
