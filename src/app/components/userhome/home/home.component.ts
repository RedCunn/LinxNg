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
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
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
    public isLinxsOpen = signal(false);
    public isPickChainOpen = signal(false);
  
    public isUser = signal(false);
    public isCandidate = signal(false);
    public isChained = signal(false); 
    public isExtendedLinx = signal(false); 
    public isMatch = signal(false); 
  
    public loadingArts = signal(true);
  
    public userdata!: IUser | null;
    public linxdata!: IAccount | null;
    public candidateData!: IUser;
    public chat!: IChat;
    public articles: IArticle[] = [];
    public article: IArticle = { articleid: '', title: '', body: '', img: '', postedOn: '', useAsProfilePic: false }
    private roomkey!: string;
  
    //__ REBUILT _
  
    //OLD : va para interactions
    public isChainBeingRequested = signal(false);
    public showBreakChainAlert = signal(false);
    public showChainBeingRequested = signal(false);
    public isChainRequested = signal(false);
    //NEW : 
    public isMyChain = signal(false);
    public isAdminChains = signal(false);
    public isSharedChains = signal(false);
    public acceptedChainsReq : Array<{chainid : string, accepted : boolean} > = [];
    //_---------------------------
    public routePattern: RegExp = new RegExp("/Linx/perfil/[^/]+", "g");
  
    constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private ref: ChangeDetectorRef) {
      
      this.userdata = this.signalStoreSvc.RetrieveUserData()();
      const routePatternMatch$ = new BehaviorSubject<string | null>(null);
      
      this.router.events.subscribe((event: Event) => {
    
        if (event instanceof NavigationStart || event instanceof NavigationEnd) {
          let signalcandidate = this.signalStoreSvc.RetrieveCandidateData()();
          if (signalcandidate !== null) {
            this.candidateData = this.signalStoreSvc.RetrieveCandidateData()()!;
            this.isCandidate.set(true);
          } else {
            this.isCandidate.set(false);
            this.linxdata = this.signalStoreSvc.RetrieveLinxData()();
          }
          if (event.url.match(this.routePattern)) {
            routePatternMatch$.next(event.url);
          } else {
            routePatternMatch$.next(null);
          }
        }
      })
  
      routePatternMatch$
        .pipe(distinctUntilChanged())
        .subscribe((url) => {
          if (url) {
            this.showChainRequested(false);
            this.isUser.set(false);
            this.isChained.set(this.isLinx());
            this.isMatch.set(this.isMyMatch());
            this.loadChatComponent();
            if(!this.isMatch() && this.isLinx()){
                this.groupLinxsOnSharedChains();
                this.isMyChain.set(false);
            }
          } else {
            this.isUser.set(true);
            this.isMyChain.set(true);
          }

          this.articles = [];
          this.setArticles();
        });
    }
    //#region ----------------- SET UP ----------------------------------------
    
    //_________ NEW BUILT :

    setArticles(){

      if(this.isCandidate()){
        this.articles = this.candidateData.account.articles ?? [];
      }

      if(this.isUser()){
        this.articles = this.userdata?.account.articles ?? [];
      }

      if(this.isMatch()){
        this.articles = this.linxdata?.articles ?? [];
      }

    }
  
    getGroupedLinxsOnChain (){
      
    }
  
    groupLinxsOnSharedChains (){
      
    }
  
  
    //____________________________________
  
    async loadChatComponent() {
      const viewContainerRef = this.chatcompoContainer;
      viewContainerRef.clear();
      await this.setChat();
      const comporef = viewContainerRef.createComponent<ChatComponent>(ChatComponent);
      comporef.setInput('isOpen', this.isChatOpen);
      comporef.setInput('chatRef', this.chat);
    }
  
    async setChat() {
      this.roomkey = this.utilsvc.setRoomKey(this.userdata?.userid! ,this.linxdata?.userid!);
      this.chat = { conversationname: this.linxdata?.linxname!, participants: { userid_a: this.userdata?.userid!, userid_b: this.linxdata?.userid! }, roomkey: this.roomkey, messages: [] }
      try {
        const res = await this.restSvc.getMyChats(this.userdata?.userid!, this.linxdata?.userid!);
        console.log('RESPONSE GETTING CHATS HOME : ', res)
        if (res.code === 0) {
          const _resMess: IChat[] = res.others;
          this.chat.messages = [];
          _resMess.forEach(chat => {
            chat.messages.forEach(mess => {
              this.chat.messages.push(mess)
            })
          })
          console.log('RES OTHERS ON SET CHAT GET MY CHATS home: ', res.others)
        } else {
          console.log('error recuperando chat...', res.message)
        }
      } catch (error) {
        console.log('error recuperando chat...', error)
      }
    }
    
    isLinx(): boolean {
      let onChain = this.userdata?.account.linxs?.find(l => l.userid === this.linxdata?.userid)
      return onChain !== undefined;
    }
  
    isMyMatch() : boolean{
      const matches = this.signalStoreSvc.RetrieveMatches()();
      let match = matches?.find(m => m.userid_a === this.linxdata?.userid || m.userid_b === this.linxdata?.userid)
      return match !== undefined;
    }
  
    //#endregion -----------------------------------------------------------------
  
    toggleChatModal() {
      this.isChatOpen.update(v => !v);
    }
  
    togglePickChainModal(){
      this.isPickChainOpen.update(v => !v);
    }
  
    showChainRequested( isOpen: boolean) {
      this.isChainRequested.set(isOpen);
    }
  
    onIsChainedChange (value : boolean){
      this.isChained.set(value);
    }
  
    onJoinChainRequestedAlertChange (isOpen : boolean){
     this.isChainRequested.set(isOpen)
    }

  
    async retrieveAccountRequests(){
      try {
        //aquí me interesan las accounts a las que yo se lo he pedido
        const res = await this.restSvc.getJoinChainRequests(this.userdata!.userid);
        if (res.code === 0) {
          const joinRequests: { requestingUserid: string, requestedUserid: string, requestedAt: Date }[] = res.userdata.reqs;
          const joinRequestings: { requestingUserid: string, requestedUserid: string, requestedAt: Date }[] = res.others.reqs;
  
          if (joinRequests.length > 0) {
            let reqIndex = joinRequests.findIndex(req => req.requestedUserid === this.linxdata?.userid)
            if (reqIndex !== -1) {
              this.isChainRequested.set(true)
            } else {
              this.isChainRequested.set(false)
            }
  
          } else {
            this.isChainRequested.set(false)
          }
  
          if (joinRequestings.length > 0) {
            let reqIndex = joinRequestings.findIndex(req => req.requestedUserid === this.userdata?.userid)
            if (reqIndex !== -1) {
              this.isChainBeingRequested.set(true)
            } else {
              this.isChainBeingRequested.set(false)
            }
          } else {
            this.isChainBeingRequested.set(false)
          }
  
        } else {
          console.log('error getting join chain reqs ...', res.error)
        }
      } catch (error) {
        console.log('error getting join chain reqs ...', error)
      }
  
    }
  
    
    //------ NEW ON SINGIN BEFORE : 
    
    
    //#region ---------------------- COMPONET'S LIFECYCLE --------------------------------
    ngAfterViewInit(): void {
      initTooltips();
      this.loadingArts.set(true);
      this.ref.detectChanges();
      this.loadingArts.set(false);
    }
    
    ngOnInit(){
      if (isPlatformBrowser(this.platformId)) {
        initFlowbite();
      }
      this.retrieveAccountRequests();
    }
  
    ngOnDestroy(): void {
      this.signalStoreSvc.StoreLinxData(null);
      this.signalStoreSvc.StoreCandidateData(null);
    }
  
    //#endregion
  
}
