import { ChangeDetectionStrategy, Component, inject, Injector, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
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
import { AsyncPipe, NgComponentOutlet, NgFor} from '@angular/common';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { createUserInjectorFn } from './tokens/injectors';
import { AccountformComponent } from './accountdata/accountform.component';
import { FormsValidationService } from '../../../../services/forms-validation.service';

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
export class SignupUserdataComponent implements OnChanges, OnInit {

  private router : Router = inject(Router);
  private restnodeSvc: RestnodeService = inject(RestnodeService);
  private formSvc : FormsValidationService = inject(FormsValidationService);

  public isChildFormValid = signal(false);
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
    ProxyfilterComponent,
    GenderfilterComponent,
    PoliticsfilterComponent,
    DietfilterComponent,
    LangfilterComponent,
    WorkfilterComponent,
    AccountformComponent
  ];

  components$! : Observable<DynamicComponentType[]>;

  injector = inject(Injector);
  myInjector!: Injector;
  createUserInjector = createUserInjectorFn();

  ngOnInit(): void { 
    this.formSvc.formValidity$.subscribe(isValid => {
      this.isChildFormValid.set(isValid);
    })    
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

  async signup() {

      try {
        const _response: IRestMessage = await this.restnodeSvc.signupNewUser(this.UserProfile);

        if (_response.code === 0) {
          this.router.navigateByUrl('/Linx/registrada');
        }
      } catch (error) {
        this.router.navigateByUrl('/Linx/error');
      }

  }

}
