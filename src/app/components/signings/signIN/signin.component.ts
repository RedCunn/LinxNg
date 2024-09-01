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
  async getAllMyLinxs(user: IUser) {
    try {
      const res = await this.restSvc.getMyLinxs(user.userid, null);
      if (res.code === 0) {
        let accounts: IAccount[] = res.others as IAccount[];
        const articles: IArticle[] = res.userdata as IArticle[];
        user.account.linxs?.forEach(c => {
          this.userRooms.set(c.userid, c.roomkey);
        })
        const wholeAccounts = this.utilsvc.putArticleObjectsIntoAccounts( articles, accounts);
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
        // res : [{connection : , account : }]
        /*        
        __v =0
        _id ='66b64286a7b3403ab594b53c'
        active =true
        connectedAt ='2024-08-09T16:23:34.228Z'
        roomkey ='7656d77e-db73-4cc4-b6ab-0008f139189b'
        userid_a ='0e9b0030-98ca-49f2-83ca-1b2c260cb88d'
        userid_b ='c08eea3a-87d4-4fe1-8e60-ae854b45b371'
        */
        const connectionObjects : any = res.userdata;
        const matches: IConnection[] = [];

        connectionObjects.forEach((obj : any) => {
          const connection : IConnection = {connectedAt : obj.connection.connectedAt, active : obj.connection.active, roomkey : obj.connection.roomkey, account : obj.account}
          matches.push(connection);
        })

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
        const wholeExtentsAccounts : IAccount[] = this.utilsvc.putArticleObjectsIntoAccounts(extentsArticles, extentsAccounts );
        
        
      }else{
        console.log('ERROR AL RECUPERAR LINXEXTENTS EN SIGNIN : ', res.error)
      }
      
    } catch (error) {
      console.log('ERROR AL RECUPERAR LINXEXTENTS EN SIGNIN : ', error)
    }
  }
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

  async Signin(loginForm: NgForm) {

    const _response: IRestMessage = await this.restSvc.signin({ emailorlinxname: loginForm.control.get('emailorlinxname')?.value.trim(), password: loginForm.control.get('password')?.value });

    if (_response.code === 0) {
      const user: IUser = _response.userdata;
      user.account.articles = _response.others;
      this.signalstoresvc.StoreUserData(user);
      this.signalstoresvc.StoreJWT(_response.token!);

      this.socketSvc.connect();
      this.socketSvc.initUserRoom(user.userid);

      await this.getAllMyLinxs(user)
      await this.getMyConnections(user.userid)
      this.utilsvc.joinRooms(this.userRooms);
      const userKeys = [];
      for (const [key, value] of this.userRooms) {
        userKeys.push(value);
      }
      this.socketSvc.userLogin(user.userid, userKeys);
      //this.utilsvc.joinRooms(this.chainRooms);
      this.router.navigateByUrl('/Linx/Inicio');
    } else {
      this.loginerrors.update(v => true);
    }

  }

}
