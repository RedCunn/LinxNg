import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule} from '@angular/forms';

import { IUser } from '../../../../../models/account/IUser';
import { FORMGROUP_TOKEN, USER_TOKEN } from '../tokens/constants';

@Component({
  selector: 'app-accountform',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './accountform.component.html',
  styleUrl: './accountform.component.scss'
})
export class AccountformComponent {

  userProfile = inject(USER_TOKEN);

  @Output() userProfileChange = new EventEmitter<IUser>();
  @Output() validForm = new EventEmitter<boolean>();

  public userDataForm! : FormGroup ;

  private showFormErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormGroup) {
        this.showFormErrors(control);
      } else {
        if (control && control.errors) {
          Object.keys(control.errors).forEach(errorKey => {
            console.log(`Campo: ${controlName}, Error: ${errorKey}`);
          });
        }
      }
    });
  }

  signup(event : Event) : void {

    event.preventDefault();

    if (this.userDataForm.valid) {
      const _userAge = this.userDataForm.get('userAge')?.value;
      const _year = _userAge.year;
      const _month = _userAge.month;
      const _day = _userAge.day;
      this.userProfile.birthday = new Date(_year, _month - 1, _day).toISOString();
      this.userProfile.account.linxname = this.userDataForm.get('linxname')?.value;
      this.userProfile.account.email = this.userDataForm.get('email')?.value;
      this.userProfile.account.password = this.userDataForm.get('password')?.value;
      this.userProfile.account.createdAt = new Date().toISOString();
      this.userProfile.name = this.userDataForm.get('name')?.value;
      this.userProfile.lastname = this.userDataForm.get('lastname')?.value;

      this.validForm.emit(true);

    } else {
      console.log('INVALID FORM : ')
      this.showFormErrors(this.userDataForm);
      this.validForm.emit(false);
    }

  }


}
