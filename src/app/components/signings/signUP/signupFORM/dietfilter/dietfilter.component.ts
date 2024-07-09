import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IUser } from '../../../../../models/account/IUser';
import { USER_TOKEN } from '../tokens/constants';

@Component({
  selector: 'app-dietfilter',
  standalone: true,
  imports: [],
  templateUrl: './dietfilter.component.html',
  styleUrl: './dietfilter.component.scss'
})
export class DietfilterComponent {

  userProfile = inject(USER_TOKEN);
  @Output() userProfileChange = new EventEmitter<IUser>();

  setUserDiet(event : any){
    this.userProfile.diet = event.target.value;
    this.userProfileChange.emit(this.userProfile)
  }
  setUserDietPref(event : any){
    const value = event.target.value;
    const shareDiet : boolean = (value === 'true');
    this.userProfile.preferences.shareDiet = shareDiet;
    this.userProfileChange.emit(this.userProfile);
  }
}
