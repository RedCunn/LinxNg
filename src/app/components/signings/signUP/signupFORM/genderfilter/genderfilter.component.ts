import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IUser } from '../../../../../models/account/IUser';

@Component({
  selector: 'app-genderfilter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './genderfilter.component.html',
  styleUrl: './genderfilter.component.scss',
  providers : []
})
export class GenderfilterComponent {
  
  @Input() validateGender! : boolean;
  @Input() userProfile! : IUser;
  @Output() userProfileChange = new EventEmitter<IUser>();
  @Output() isValidGenders = new EventEmitter<boolean>;

  public isValid : boolean = false;
  public userGenderPrefsList = signal<string[]>([]);
  

  setGenderPref (gen : any){
   
    const selectedGen : string = gen.target.value;
    const checked : boolean = gen.target.checked;


    if(checked){
      this.userGenderPrefsList.update(values => {
          return [...values, selectedGen]
      })
    }else{
      this.userGenderPrefsList.update(values =>   values.filter(g => g !== selectedGen))
    }
    this.userProfile.preferences.genders = this.userGenderPrefsList();

    if(this.userProfile.preferences.genders.length > 0 && this.userProfile.gender !== ''){
      this.isValid = true;
      this.isValidGenders.emit(true);
      this.userProfileChange.emit(this.userProfile);
    }else{
      this.isValid = false;
      this.isValidGenders.emit(false);
      this.userProfileChange.emit(this.userProfile);
    }

  }

}
