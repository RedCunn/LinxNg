import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { Router } from '@angular/router';
import { IUser } from '../../../models/account/IUser';
import { IAdminGroups } from '../../../models/chain/IAdminGroups';
import { MyChainComponent } from '../../mychains/chain/mychain.component';

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
  public allChains! : IAdminGroups[];

  constructor(private router : Router){
    this.user = this.signalStoreSvc.RetrieveUserData()()!;
  }

  ngOnInit(): void {
    if(this.signalStoreSvc.RetrieveAllUserChainsGroupedByAdmin()() !== null){
      this.allChains = this.signalStoreSvc.RetrieveAllUserChainsGroupedByAdmin()()!
    }else{
      this.allChains = []
    }
    this.isMyChain.set(false);
    this.isSharedChain.set(false);
    this.isAllChains.set(true);
  }

  goInit(){
    this.router.navigateByUrl(`/Linx/Inicio`);
  }
  goHome(){
    this.router.navigateByUrl(`/Linx/Home`);
  }

  toggleMyChainModal() {
    this.isMyChainOpen.update(v => !v);
  }

}
