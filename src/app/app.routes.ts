import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path : 'Linx',
        loadComponent: () => import('./components/welcome/welcome.component').then(c=>c.WelcomeComponent)
    },
    {
        path: 'Linx',
        children: 
        [
            {
                path:'error',
                loadComponent: () => import('./components/errors/general/errorpage.component').then(c=>c.ErrorpageComponent)
            },
            {
                path : 'Inicio',
                loadComponent : () => import('./components/getstarted/getstarted.component').then(c => c.GetstartedComponent),
                canActivate: [authGuard]
            },
            {
                path:'linxme',
                loadComponent : () => import('./components/matchcarousel/matchcarousel.component').then(c => c.MatchcarouselComponent),
                canActivate: [authGuard]
            },
            {
                path: 'Registro',
                loadComponent : ()=> import('./components/signings/signUP/signupFORM/accountdata/signup-userdata.component').then(c => c.SignupUserdataComponent)
            },
            {
                path:'registrada',
                loadComponent : () => import('./components/signings/signUP/signedupOK/signedup-ok.component').then(c => c.SignedupOKComponent)
            },
            {
                path : 'activa',
                loadComponent : () => import('./components/signings/signUP/signedupOK/activatedAccountOK/activated-ok.component').then(c => c.ActivatedOkComponent)
            },
            {
                path : 'Login',
                loadComponent : () => import('./components/signings/signIN/signin.component').then(m=> m.SigninComponent)
            }
        ]
    },
    {
        path:'',
        redirectTo:'Linx/Login',
        pathMatch:'full'
    }
];
