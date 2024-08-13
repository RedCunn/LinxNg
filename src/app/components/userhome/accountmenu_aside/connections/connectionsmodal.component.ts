import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { IConnection } from '../../../../models/account/IConnection';
import { Router } from '@angular/router';
import { IAccount } from '../../../../models/account/IAccount';
import { SignalStorageService } from '../../../../services/signal-storage.service';

@Component({
  selector: 'app-connectionsmodal',
  standalone: true,
  imports: [],
  templateUrl: './connectionsmodal.component.html',
  styleUrl: './connectionsmodal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionsmodalComponent {

  private router = inject(Router);
  private signalsvc = inject(SignalStorageService);

  @Input() isOpen = signal(false);
  @Input() isMenuOpen = signal(true);
  @Input() connections : IConnection[] = [];
  
  closeModal() {
    this.isOpen.set(false);
    this.isMenuOpen.set(true);
  }

  goToConnectionProfile(account : IAccount){
    this.signalsvc.StoreLinxData(account);
    console.log('SAVING ACCOUNT connected : ', this.signalsvc.RetrieveLinxData()());
    this.router.navigateByUrl(`Linx/conecta/${account.linxname}`)
  }
}
