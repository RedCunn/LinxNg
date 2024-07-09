import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SignalStorageService } from './signal-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  private signalStorageSvc : SignalStorageService = inject(SignalStorageService);

  isLoggedIn() : boolean{
    
    const jwt = this.signalStorageSvc.RetrieveJWT();
    
    if(jwt()){
      return true;
    }else{
      return false;
    }

  }
}
