import { Component, EventEmitter, inject, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import { IUser } from '../../../../../models/account/IUser';
import { USER_TOKEN } from '../tokens/constants';
import { compareToValidator } from '../../../../../validators/compareTo';
import { FormsValidationService } from '../../../../../services/forms-validation.service';

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

  private formSvc = inject(FormsValidationService);

  public userDataForm! : FormGroup ;

  constructor(private _formBuilder: FormBuilder) {

    this.userDataForm = this._formBuilder.group({
      userAge: this._formBuilder.control({
        year: 0,
        month: 0,
        day: 0
      }),
      linxname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
      reppassword: new FormControl('', [Validators.required, compareToValidator('password')])
    });

    this.userDataForm.statusChanges.subscribe(status => {
      this.formSvc.emitFormValidity(status === "VALID")
    })

  }

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

      this.userProfileChange.emit(this.userProfile);


    } else {
      console.log('INVALID FORM : ')
      this.showFormErrors(this.userDataForm)
    }

  }


}
