import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUser } from '../../../../../models/account/IUser';

@Component({
  selector: 'app-politicsfilter',
  standalone: true,
  imports: [],
  templateUrl: './politicsfilter.component.html',
  styleUrl: './politicsfilter.component.scss'
})
export class PoliticsfilterComponent {
  
  @Input() userProfile! : IUser;
  @Output() userProfileChange = new EventEmitter<IUser>();

  setUserPolitics(event : any){
    this.userProfile.politics = event.target.value;
    this.userProfileChange.emit(this.userProfile);
  }
  setUserPoliPref (event : any){
    this.userProfile.preferences.sharePolitics = event.target.value;
    this.userProfileChange.emit(this.userProfile);
  }
}
