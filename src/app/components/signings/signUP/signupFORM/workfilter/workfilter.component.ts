import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { IUser } from '../../../../../models/account/IUser';
import { USER_TOKEN } from '../tokens/constants';

@Component({
  selector: 'app-workfilter',
  standalone: true,
  imports: [],
  templateUrl: './workfilter.component.html',
  styleUrl: './workfilter.component.scss'
})
export class WorkfilterComponent {

  userProfile = inject(USER_TOKEN);
  @Output() userProfileChange = new EventEmitter<IUser>();

  public hasOtherIndustry = signal<boolean>(false);
  public industry : string = '';
  public otherindustry : string = '';

  getSelectedText(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
    if(selectedOptionText === 'Otro'){
      this.industry = 'Otro : ' 
    }else{
      this.industry = selectedOptionText
    }
    
    console.log(selectedOptionText); 
  }

  getOtherIndustryText(event : Event){
    let name = (event.target as HTMLInputElement).value;
    this.otherindustry = name
  }

  setUserWorkPref(event : any){
    this.userProfile.preferences.shareIndustry = event.target.value;
    this.userProfileChange.emit(this.userProfile);
  }
}
