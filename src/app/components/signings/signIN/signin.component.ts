import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IRestMessage } from '../../../models/IRestMessage';
import { RestnodeService } from '../../../services/restnode.service';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { WebsocketService } from '../../../services/websocket.service';
import { UtilsService } from '../../../services/utils.service';
import { IUser } from '../../../models/account/IUser';
import { IAccount } from '../../../models/account/IAccount';
import { IArticle } from '../../../models/account/IArticle';
import { IConnection } from '../../../models/account/IConnection';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {

  private socketSvc: WebsocketService = inject(WebsocketService);
  private signalstoresvc: SignalStorageService = inject(SignalStorageService);
  private utilsvc : UtilsService = inject(UtilsService);

  @ViewChild('emailorlinxname') emailorlinxname!: ElementRef;
  @ViewChild('password') password!: ElementRef;

  public credentials: { emailorlinxname: String, password: String } = { emailorlinxname: '', password: '' };
  public loginerrors = signal(false);

  private userRooms: Map<string,string> = new Map<string,string>();
  constructor(private router: Router, private restSvc: RestnodeService) { }

  private chainRooms :  Map<string,string> = new Map<string,string>();

  goToSignup() {
    this.router.navigateByUrl('/Linx/Registro');
  }

  //#region ---- GETTING ALL MY LINXS WHOLEACCOUNTS, MATCHES-WHOLEACCOUNTS, EXTENTS-WHOLEACCOUNT
  async getAllMyLinxs(user: IUser) {
    try {
      const res = await this.restSvc.getMyLinxs(user.userid, null);
      if (res.code === 0) {
        let accounts: IAccount[] = res.others as IAccount[];
        const articles: IArticle[] = res.userdata as IArticle[];
        user.account.linxs?.forEach(c => {
          this.userRooms.set(c.userid, c.roomkey);
        })
        const wholeAccounts = this.utilsvc.putArticleObjectsIntoAccounts(accounts, articles);
        this.signalstoresvc.StoreMyLinxs(wholeAccounts);
      } else {
        console.log('mychain never found...')
      }
    } catch (error) {
      console.log('mychain never found...', error)
    }
  }

  async getMyConnections(userid: string) {
    try {
      const res = await this.restSvc.getMyConnections(userid)
      if (res.code === 0) {
        const matches: IConnection[] = res.userdata;

        matches.forEach(element => {
            this.userRooms.set(element.account.userid ,element.roomkey);
        });
               
        this.signalstoresvc.StoreConnections(matches);
        
      } else {
        console.log('myMATCHA never found...', res.error)
      }
    } catch (error) {
      console.log('myMATCHA never found...', error)
    }
  }

  async getChainExtents (userid : string){
    try {
      const res = await this.restSvc.getMyChainExtents(userid , null)
      if(res.code === 0){
        const extentsAccounts : IAccount[] = res.others.accounts as IAccount[]
        const extentsArticles : IArticle[] = res.others.articles as IArticle[]
        const wholeExtentsAccounts : IAccount[] = this.utilsvc.putArticleObjectsIntoAccounts(extentsAccounts , extentsArticles);
        
        
      }else{
        console.log('ERROR AL RECUPERAR LINXEXTENTS EN SIGNIN : ', res.error)
      }
      
    } catch (error) {
      console.log('ERROR AL RECUPERAR LINXEXTENTS EN SIGNIN : ', error)
    }
  }
//#endregion


//#region ------ CARGAR TODAS LAS CADENAS DE LAS QUE FORMO PARTE AGRUPADAS POR ADMIN PARA EL ACCESO DESDE LOGGEDHEADER
//!NO CARGO ARTÍCULOS, hay que peedirlos cada vez que el user acceda a uno de sus perfiles 
//!NO INICIALIZO CHATS, tendré que unirme a sala cada vez que visite perfil 
async getAllChainsGroupedByAdmin (userid : string){
  try {
    const res = await this.restSvc.getAllUserChainsGroupedByAdmin(userid)

    if(res.code === 0){
      
    }else{
      console.log('COULDNT GET ALL USER CHAINs GROUPED BY ADMIN...', res.error)
    }
  } catch (error) {
    console.log('COULDNT GET ALL USER CHAINs GROUPED BY ADMIN...', error)
  }
}
//#endregion

  async Signin(loginForm: NgForm) {

    const _response: IRestMessage = await this.restSvc.signin({ emailorlinxname: loginForm.control.get('emailorlinxname')?.value, password: loginForm.control.get('password')?.value });

    if (_response.code === 0) {
      const user: IUser = _response.userdata;
      user.account.articles = _response.others;
      this.signalstoresvc.StoreUserData(user);
      this.signalstoresvc.StoreJWT(_response.token!);

      this.socketSvc.connect();
      this.socketSvc.initUserRoom(user.userid);

      await this.getAllMyLinxs(user)
      await this.getMyConnections(user.userid)
      
      this.socketSvc.userLogin(user.account._id!, user.account.linxname);
      this.utilsvc.joinRooms(this.userRooms);
      this.utilsvc.joinRooms(this.chainRooms);

      this.router.navigateByUrl('/Linx/Inicio');
    } else {
      this.loginerrors.update(v => true);
    }

  }

}
