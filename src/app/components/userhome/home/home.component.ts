import { AfterViewInit, ChangeDetectorRef, Component, Inject, inject, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { UtilsService } from '../../../services/utils.service';
import { IUser } from '../../../models/account/IUser';
import { IAccount } from '../../../models/account/IAccount';
import { IChat } from '../../../models/chat/IChat';
import { IArticle } from '../../../models/account/IArticle';
import { Event, NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite, initTooltips } from 'flowbite';
import { ChatComponent } from '../../chat/privatechat/chat.component';
import { HomeasideComponent } from '../accountmenu_aside/homeaside.component';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ArticleformComponent } from '../articles/modalform/articleform.component';
import { AdminasideComponent } from '../admin_aside/adminaside.component';
import { CandidatedataComponent } from '../data_aside/candidatedata.component';
import { ArticlestrayComponent } from '../articles/articlestray/articlestray.component';
import { LinxsonchainComponent } from '../../mychains/linxs/linxsonchain.component';
import { IConnection } from '../../../models/account/IConnection';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeasideComponent,
    ChatComponent,
    MatIcon,
    FormsModule,
    RouterModule,
    ArticleformComponent,
    AdminasideComponent,
    CandidatedataComponent,
    ArticlestrayComponent,
    LinxsonchainComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private socketsvc: WebsocketService = inject(WebsocketService);
  private signalStoreSvc: SignalStorageService = inject(SignalStorageService);
  private restSvc: RestnodeService = inject(RestnodeService);
  private utilsvc: UtilsService = inject(UtilsService);

  @ViewChild('chatcompoContainer', { read: ViewContainerRef, static: true })
  public chatcompoContainer!: ViewContainerRef;

  public isChatOpen = signal(false);
  public isArtFormOpen = signal(false);
  public isConnectionsOpen = signal(false);
  public isLinxsOpen = signal(false);
  public isPickChainOpen = signal(false);

  public isUser = signal(false);
  public isCandidate = signal(false);
  public isLinx = signal(false);
  public isMatch = signal(false);

  public loadingArts = signal(true);

  public userdata!: IUser | null;
  public linxdata!: IAccount | null;
  public candidateData!: IUser;
  public chat!: IChat;
  public articles: IArticle[] = [];
  public article: IArticle = { articleid: '', title: '', body: '', img: '', postedOn: '', useAsProfilePic: false }
  private roomkey!: string;

  public userConnections: IConnection[] = [];

  private userRoutePattern: RegExp = new RegExp("/Linx/cuenta", "g");
  private candidateRoutePattern: RegExp = new RegExp("/Linx/perfil/[^/]+", "g");
  private connectionRoutePattern: RegExp = new RegExp("/Linx/conecta/[^/]+", "g");
  private linxRoutePattern: RegExp = new RegExp("/Linx/inx/[^/]+", "g");

  private userType$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private ref: ChangeDetectorRef) {

    this.userdata = this.signalStoreSvc.RetrieveUserData()();

    this.router.events
    .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        map(url => {
            if (this.userRoutePattern.test(url)) {
                this.setUserType('user');
                return 'user';
            } else if (this.candidateRoutePattern.test(url)) {
                this.candidateData = this.signalStoreSvc.RetrieveCandidateData()()!;
                this.setUserType('candidate');
                return 'candidate';
            } else if (this.connectionRoutePattern.test(url)) {
                this.linxdata = this.signalStoreSvc.RetrieveLinxData()()!;
                console.log('LINX DATA: ', this.linxdata);
                this.setUserType('match');
                return 'match';
            } else if (this.linxRoutePattern.test(url)) {
                this.linxdata = this.signalStoreSvc.RetrieveLinxData()()!;
                this.setUserType('linx');
                return 'linx';
            } else {
                return null;
            }
        })
    )
    .subscribe(userType => {
        this.userType$.next(userType);
        this.setArticles(userType);
        if (userType === 'linx' || userType === 'match') {
            this.setChat();
            this.loadChatComponent();
        }
    });

    this.userType$
    .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
    .subscribe();
  }
  //#region ----------------- SET UP ----------------------------------------

  setUserType(type: string) {
    this.isUser.set(false);
    this.isCandidate.set(false);
    this.isMatch.set(false);
    this.isLinx.set(false);

    switch (type) {
      case 'user':
        this.isUser.set(true);
        break;
      case 'match':
        this.isMatch.set(true);
        break;
      case 'linx':
        this.isLinx.set(true);
        break;
      case 'candidate':
        this.isCandidate.set(true);
        break;
      default:
        break;
    }
  }

  setArticles(usertype: string | null) {
    this.articles = [];

    switch (usertype) {
      case 'user':
        this.articles = this.userdata?.account.articles ?? [];
        break;
      case 'linx':
        this.articles = this.linxdata?.articles ?? [];
        break;
      case 'match':
        this.articles = this.linxdata?.articles ?? [];
        break;
      case 'candidate':
        this.articles = this.candidateData.account.articles ?? [];
        break;
      default:
        this.articles = [];
        break;
    }
  }

  loadChatComponent() {
    const viewContainerRef = this.chatcompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<ChatComponent>(ChatComponent);
    comporef.setInput('isOpen', this.isChatOpen);
    comporef.setInput('chatRef', this.chat);
  }

  async setChat() {

    if (this.isMatch()) {
      const connections = this.signalStoreSvc.RetrieveConnections()();
      const connectionIndex = connections?.findIndex(conn => conn.account.userid === this.linxdata?.userid)
      this.roomkey = connections?.at(connectionIndex!)?.roomkey || this.utilsvc.setRoomKey(this.userdata?.userid!, this.linxdata?.userid!);
    } else if (this.isLinx()) {
      this.roomkey = this.utilsvc.setRoomKey(this.userdata?.userid!, this.linxdata?.userid!);
    }

    this.chat = { name: this.linxdata?.linxname!, participants: { userid_a: this.userdata?.userid!, userid_b: this.linxdata?.userid! }, roomkey: this.roomkey, messages: [] }

    try {
      const res = await this.restSvc.getChat(this.roomkey);
      if (res.code === 0) {
        const _resMess: IChat[] = res.others;
        this.chat.messages = [];
        _resMess.forEach(chat => {
          chat.messages.forEach(mess => {
            this.chat.messages.push(mess);
          });
        });
      } else {
        console.log('error recuperando chat...', res.message);
      }
    } catch (error) {
      console.log('error recuperando chat...', error);
    }

  }

  //#endregion -----------------------------------------------------------------


  //#region ------------------------ RETRIEVING ITEMS -------------------

  async retrieveUserConnections() {

    try {
      const res = await this.restSvc.retrieveUserConnections(this.userdata?.userid!);
      if (res.code === 0) {

        const connectionsmap: { connection: { connectedAt: string, active: boolean, userid_a: string, userid_b: string, roomkey: string }, account: IAccount, articles: IArticle[] }[] = res.userdata;

        connectionsmap.forEach(item => {
          const connection: IConnection = { account: item.account, roomkey: item.connection.roomkey, connectedAt: item.connection.connectedAt, active: item.connection.active }
          connection.account.articles = [];
          connection.account.articles = item.articles;
          this.userConnections.push(connection);
        })
        this.signalStoreSvc.StoreConnections(this.userConnections);
      } else {
        console.log('ERROR : ', res.error)
      }
    } catch (error) {
      console.log('ERROR RETRIEVING USER CONNECTIONS AT HOME : ', error)
    }
  }

  // async retrieveAccountRequests(){
  //   try {
  //     //aquí me interesan las accounts a las que yo se lo he pedido
  //     const res = await this.restSvc.getJoinChainRequests(this.userdata!.userid);
  //     if (res.code === 0) {
  //       const joinRequests: { requestingUserid: string, requestedUserid: string, requestedAt: Date }[] = res.userdata.reqs;
  //       const joinRequestings: { requestingUserid: string, requestedUserid: string, requestedAt: Date }[] = res.others.reqs;

  //       if (joinRequests.length > 0) {
  //         let reqIndex = joinRequests.findIndex(req => req.requestedUserid === this.linxdata?.userid)
  //         if (reqIndex !== -1) {
  //           this.isChainRequested.set(true)
  //         } else {
  //           this.isChainRequested.set(false)
  //         }

  //       } else {
  //         this.isChainRequested.set(false)
  //       }

  //       if (joinRequestings.length > 0) {
  //         let reqIndex = joinRequestings.findIndex(req => req.requestedUserid === this.userdata?.userid)
  //         if (reqIndex !== -1) {
  //           this.isChainBeingRequested.set(true)
  //         } else {
  //           this.isChainBeingRequested.set(false)
  //         }
  //       } else {
  //         this.isChainBeingRequested.set(false)
  //       }

  //     } else {
  //       console.log('error getting join chain reqs ...', res.error)
  //     }
  //   } catch (error) {
  //     console.log('error getting join chain reqs ...', error)
  //   }

  // }

  //#endregion

  //#region --------------------- TOGGLE MODALS --------------------------

  toggleChatModal() {
    this.isChatOpen.update(v => !v);
  }

  //#endregion

  //#region ---------------------- COMPONET'S LIFECYCLE --------------------------------
  ngAfterViewInit(): void {
    initTooltips();
    this.loadingArts.set(true);
    this.ref.detectChanges();
    this.loadingArts.set(false);
    this.retrieveUserConnections();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion

}
