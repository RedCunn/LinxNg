import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Injector, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AgefilterComponent } from './agefilter/agefilter.component';
import { GenderfilterComponent } from './genderfilter/genderfilter.component';
import { PoliticsfilterComponent } from './politicsfilter/politicsfilter.component';
import { DietfilterComponent } from './dietfilter/dietfilter.component';
import { LangfilterComponent } from './langfilter/langfilter.component';
import { WorkfilterComponent } from './workfilter/workfilter.component';
import { ProxyfilterComponent } from './proxyfilter/proxyfilter.component';
import { RestnodeService } from '../../../../services/restnode.service';
import { IAccount } from '../../../../models/account/IAccount';
import { IUser } from '../../../../models/account/IUser';
import { IRestMessage } from '../../../../models/IRestMessage';
import { compareToValidator } from '../../../../validators/compareTo';
import { AsyncPipe, NgComponentOutlet, NgFor} from '@angular/common';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { createUserInjectorFn } from './tokens/injectors';
import { AccountformComponent } from './accountdata/accountform.component';

type DynamicComponentType =
  typeof AgefilterComponent |
  typeof GenderfilterComponent |
  typeof PoliticsfilterComponent |
  typeof DietfilterComponent |
  typeof LangfilterComponent |
  typeof WorkfilterComponent |
  typeof ProxyfilterComponent | 
  typeof AccountformComponent;

@Component({
  selector: 'app-signup-userdata',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule,
    AgefilterComponent,
    GenderfilterComponent,
    PoliticsfilterComponent,
    DietfilterComponent,
    LangfilterComponent,
    WorkfilterComponent,
    ProxyfilterComponent,
    AccountformComponent,
    NgComponentOutlet,
    AsyncPipe,
    NgFor
  ],
  templateUrl: './signup-userdata.component.html',
  styleUrl: './signup-userdata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupUserdataComponent implements AfterViewInit, OnChanges {

  private restnodeSvc: RestnodeService = inject(RestnodeService);

  public userDataForm!: FormGroup;
  public activeForm = signal(false);
  public hideWarning = signal(false);

  public filtersFormShowing: Boolean = true;
  public userProfFormShowing: Boolean = false;

  public sectionPag = new BehaviorSubject<number>(0);
  public validateAge: boolean = false;
  public validateGender: boolean = false;
  public isValidGenders: boolean = false;

  componentArray: DynamicComponentType[] = [
    AgefilterComponent,
    GenderfilterComponent,
    PoliticsfilterComponent,
    DietfilterComponent,
    LangfilterComponent,
    WorkfilterComponent,
    ProxyfilterComponent,
    AccountformComponent
  ];

  components$! : Observable<DynamicComponentType[]>;

  injector = inject(Injector);
  myInjector!: Injector;
  createUserInjector = createUserInjectorFn();

  ngAfterViewInit(): void { 
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.myInjector = this.createUserInjector(changes['user'].currentValue)
  }

  moveSection(arrow: string) {
    switch (arrow) {
      case "back":
        this.sectionPag.next(this.sectionPag.value - 1);
        console.log('USER PROFILE VALUE : ', this.UserProfile)
        break;
      case "forward":
        this.sectionPag.next(this.sectionPag.value + 1);
        console.log('USER PROFILE VALUE : ', this.UserProfile)
        break;
      default:
        break;
    }
  }

  initForm(){
    this.myInjector = this.createUserInjector(this.UserProfile);
    this.components$ = this.sectionPag.pipe(
      map(index => [this.componentArray[index]])
    );
    this.activeForm.set(true);
  }

  private UserAccount: IAccount = {
    _id: '',
    userid: '',
    createdAt: '',
    linxname: '',
    email: '',
    password: '',
    active: false
  }
  public UserProfile: IUser = {
    userid: '',
    accountid: '',
    name: '',
    lastname: '',
    preferences: {
      ageRange: {
        fromAge: 16,
        toAge: 120
      },
      genders: [],
      proxyRange: 'city',
      sharePolitics: 'false',
      shareDiet: false,
      languages: ['Español'],
      shareIndustry: 'false'
    },
    account: this.UserAccount,
    birthday: '',
    gender: '',
    geolocation: {
      country_id: '',
      city_id: '',
      area1_id: '',
      area2_id: '',
      global_code: ''
    },
    diet: 'omnivore',
    languages: ['Español'],
    politics: 'none',
    work: {
      industry: '',
      other: ''
    }
  }
  constructor(private _formBuilder: FormBuilder, private router: Router) {

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

  }

  async signup() {

    if (this.userDataForm.valid) {
      const _userAge = this.userDataForm.get('userAge')?.value;
      const _year = _userAge.year;
      const _month = _userAge.month;
      const _day = _userAge.day;
      this.UserProfile.birthday = new Date(_year, _month - 1, _day).toISOString();
      this.UserAccount.linxname = this.userDataForm.get('linxname')?.value;
      this.UserAccount.email = this.userDataForm.get('email')?.value;
      this.UserAccount.password = this.userDataForm.get('password')?.value;
      this.UserAccount.createdAt = new Date().toISOString();
      this.UserProfile.name = this.userDataForm.get('name')?.value;
      this.UserProfile.lastname = this.userDataForm.get('lastname')?.value;
      this.UserProfile.account = this.UserAccount;

      try {
        const _response: IRestMessage = await this.restnodeSvc.signupNewUser(this.UserProfile);

        if (_response.code === 0) {
          this.router.navigateByUrl('/Linx/registrada');
        }


      } catch (error) {
        this.router.navigateByUrl('/Linx/error');
      }

    } else {
      console.log('INVALID FORM : ')
      this.showFormErrors(this.userDataForm);
    }

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


  onValidGenders(valid: boolean) {
    this.isValidGenders = valid;
  }

  onUserProfileChange(newProf: any) {
    this.UserProfile = newProf;
  }

  showFiltersForm() {
    this.filtersFormShowing = true;
    this.userProfFormShowing = false;
  }

  showUserProfForm() {
    this.userProfFormShowing = true;
    this.filtersFormShowing = false;
  }


}
