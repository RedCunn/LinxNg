import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormsValidationService {

  private formValiditySubject = new Subject<boolean>();
  formValidity$ = this.formValiditySubject.asObservable();

  emitFormValidity(isValid: boolean) {
    this.formValiditySubject.next(isValid);
  }
  
}
