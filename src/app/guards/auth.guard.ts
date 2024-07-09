import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn | CanActivateChildFn = (route, state) =>{
  const authSvc = inject(AuthService);
  const router = inject(Router);
  
  if(!authSvc.isLoggedIn()){
    return router.parseUrl('/Linx/Login');
  }else{
    return true;
  }
};