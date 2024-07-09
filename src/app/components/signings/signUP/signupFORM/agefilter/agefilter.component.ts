import { Component, Input, Output , EventEmitter, forwardRef, ChangeDetectionStrategy, inject} from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { IUser } from '../../../../../models/account/IUser';
import { USER_TOKEN } from '../tokens/constants';

@Component({
  selector: 'app-agefilter',
  standalone: true,
  imports: [MatSliderModule, ReactiveFormsModule],
  templateUrl: './agefilter.component.html',
  styleUrl: './agefilter.component.scss',
  providers : [
    {provide: NG_VALUE_ACCESSOR, useExisting : forwardRef(()=> AgefilterComponent), multi: true},
    {provide : NG_VALIDATORS, useExisting : forwardRef(()=> AgefilterComponent), multi: true}
  ]
})
export class AgefilterComponent implements ControlValueAccessor, Validator{
  
  userProfile = inject(USER_TOKEN);
  @Output() userProfileChange = new EventEmitter<IUser>();

  private _onChange : Function = (_value : {year: number, month : number , day : number}) => {}
  private _onTouch : Function = (_value : {year: number, month : number , day : number}) => {}

  days: number[] = [];
  months: string[] = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  years: number[] = Array.from({ length: 100 }, (el, pos) => (new Date(Date.now()).getFullYear() - 16) - pos);

  constructor(private _FB : FormBuilder) {
    
    this.ageForm.valueChanges.pipe(debounceTime(100))
                             .subscribe(()=> {
                                this._onChange(this.ageForm.value)
                                this._onTouch(this.ageForm.value)
                              }) 
  }

  
  public ageForm : FormGroup = this._FB.group({
    year : [ 0,Validators.min(2)],
    month : [0,Validators.min(1)],
    day : [0, Validators.min(1)]
  })


  validate(_control: AbstractControl<any, any>): ValidationErrors | null {
    return this.ageForm.valid? null : {invalidAge : true}
  }

  //#region  ................... Control Value Accessor

  writeValue(obj: {year : number, month: number, day : number}): void {
    this.ageForm.setValue(obj);
  }

  registerOnChange(fn: Function): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: Function): void {
   this._onTouch = fn;
  }

  //#endregion


  loadDaysOfMonth(value: string) {
    if (value === '-1') {
      this.days = [];
    } else {
      let month: number = parseInt(value);
      if (month % 2 === 0) {
        if (month === 2) {
          this.days = Array.from({ length: 29 }, (el, pos) => pos + 1);
        } else {
          this.days = Array.from({ length: 30 }, (el, pos) => pos + 1);
        }
      } else {
        this.days = Array.from({ length: 31 }, (el, pos) => pos + 1);
      }

    }

  }
  setFromAgeRange(event : any){
   this.userProfile.preferences.ageRange.fromAge = event.target.value;
   this.userProfileChange.emit(this.userProfile);
  }
  setToAgeRange(event : any){
    this.userProfile.preferences.ageRange.toAge = event.target.value;
    this.userProfileChange.emit(this.userProfile);
  }



}
