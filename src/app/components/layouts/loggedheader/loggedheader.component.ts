import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { Router } from '@angular/router';
import { IUser } from '../../../models/account/IUser';
import { MyChainComponent } from '../../mychains/chain/mychain.component';
import { IChain } from '../../../models/chain/IChain';

@Component({
  selector: 'app-loggedheader',
  standalone: true,
  imports: [MyChainComponent],
  templateUrl: './loggedheader.component.html',
  styleUrl: './loggedheader.component.scss'
})
export class LoggedheaderComponent implements OnInit{
  
  private signalStoreSvc : SignalStorageService = inject(SignalStorageService);

  public isMyChainOpen = signal(false);
  public isMyChain = signal(false);
  public isSharedChain = signal(false);
  public isAllChains = signal(true);
  private user! : IUser;
  private allChains : IChain[] = [];
  
  constructor(private router : Router){
    this.user = this.signalStoreSvc.RetrieveUserData()()!;
  }

  ngOnInit(): void {
    //!RETRIEVE ALL CHAINS GROUPED 
    this.isMyChain.set(false);
    this.isSharedChain.set(false);
    this.isAllChains.set(true);
  }

  goInit(){
    this.router.navigateByUrl(`/Linx/Inicio`);
  }
  goHome(){
    this.router.navigateByUrl(`/Linx/cuenta/${this.user.account.linxname}`);
  }

  toggleMyChainModal() {
    this.isMyChainOpen.update(v => !v);
  }

}
