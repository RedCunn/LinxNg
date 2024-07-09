import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { IUser } from '../../../../../models/account/IUser';

@Component({
  selector: 'app-workfilter',
  standalone: true,
  imports: [],
  templateUrl: './workfilter.component.html',
  styleUrl: './workfilter.component.scss'
})
export class WorkfilterComponent {

  @Input() userProfile! : IUser;
  @Output() userProfileChange = new EventEmitter<IUser>();

  public hasOtherIndustry = signal<boolean>(false);

  setUserWorkPref(event : any){
    this.userProfile.preferences.shareIndustry = event.target.value;
    this.userProfileChange.emit(this.userProfile);
  }
}
