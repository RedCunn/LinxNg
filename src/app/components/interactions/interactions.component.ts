import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RestnodeService } from '../../services/restnode.service';
import { SignalStorageService } from '../../services/signal-storage.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { IUser } from '../../models/account/IUser';
import { IAccount } from '../../models/account/IAccount';
import { IInteraction } from '../../models/account/IInteraction';
import { IChainInvite } from '../../models/chain/IChainInvite';
import { IArticle } from '../../models/account/IArticle';

@Component({
  selector: 'app-interactions',
  standalone: true,
  imports: [],
  templateUrl: './interactions.component.html',
  styleUrl: './interactions.component.scss'
})
export class InteractionsComponent implements OnInit, OnDestroy {

  @Input() isOpen = signal(false)

  closeModal() {
    this.isOpen.set(false);
  }

  private restSvc = inject(RestnodeService);
  private signalStorageSvc = inject(SignalStorageService);
  private websocketsvc = inject(WebsocketService);
  private utilsvc = inject(UtilsService);
  private router = inject(Router);

  private _user!: IUser | null;
  public myMatches!: IAccount[] | null;
  public joinChainReqs : {requestingUserid : string , requestedUserid : string ,chain : {chainid : string , chainname : string}, requestedAt : Date} [] = []; 

  private destroy$ = new Subject<void>();
  public interactions: IInteraction = { matchingAccounts: [], chainedAccounts: [], chainInvitations: [] , refusedInvitations : [], brokenChains : []};

  public currentDate : Date = new Date();

  public signalOpenUnMatchAlert = signal<{[key : string]: boolean}>({});
  private setUnMatchAlertOpen : {[key : string]: boolean} = {};
  public openChainInvitationAlert = signal<{[key : string]: boolean}>({});
  private setChainInvitationAlertOpen : {[key : string]: boolean} = {};

  constructor(private ref: ChangeDetectorRef) {
    this.websocketsvc.getInteractions().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      switch (data.type) {
        case 'match':
          console.log('FULL MATCH :::::::::::::::::', data)
          let accountInteracting = data.from
          this.interactions.matchingAccounts!.unshift(accountInteracting);
          this.interactions.matchingAccounts?.forEach(acc => {
            if(!this.setUnMatchAlertOpen[acc.userid]){
              this.setUnMatchAlertOpen[acc.userid] = false
            }
          })
          this.signalOpenUnMatchAlert.set(this.setUnMatchAlertOpen)
          this.ref.detectChanges();
          break;
        case 'chain':
          console.log('CHAINED :::::::::::::::::', data)
          const account = data.from
          const chainAccepted = data.element!
          const newLinx = {account , chain : chainAccepted}
          this.interactions.chainedAccounts!.unshift(newLinx);
          this.ref.detectChanges();
          break;
        case 'rejectchain':
            console.log('REJECTED CHAIN :::::::::::::::::', data)
            const rejectingAccount = data.from
            const chainRejected = data.element!
            const interaction = {account : rejectingAccount, chain : chainRejected}
            this.interactions.refusedInvitations!.unshift(interaction);
            this.ref.detectChanges();
            break;
        case 'reqchain':
          console.log('REQUESTED CHAIN :::::::::::::::::', data)
          const fromAccount : IAccount = data.from as IAccount;
          const chain  = data.element;
          const newInvitation : IChainInvite = {fromaccount : fromAccount , touserid : this._user?.userid! , daysOfRequest : 0,chain : chain!}
          this.interactions.chainInvitations!.unshift(newInvitation);
          this.interactions.chainInvitations?.forEach(inv => {
            if(!this.setChainInvitationAlertOpen[inv.chain.chainid]){
              this.setChainInvitationAlertOpen[inv.chain.chainid] = false
            }
          })
          this.openChainInvitationAlert.set(this.setChainInvitationAlertOpen)
          this.ref.detectChanges();
          break;
        case 'broken':
          console.log('BROKEN CHAIN :::::::::::::::::', data)
          const username = data.from.linxname
          const chainname = data.element?.chainname!
          const newBreakup = {user : username , chain : chainname}
          this.interactions.brokenChains?.unshift(newBreakup);
          break;
        default:
          break;
      }

    });
  }

  async acceptUnion(linx : IAccount, chain : {chainid : string , chainname : string}){
    try {
      const chainMap : Map<string,string> = new Map<string,string>();
      chainMap.set(chain.chainid , chain.chainname)
      const res = await this.restSvc.requestJoinChain(linx.userid, this._user!.userid!, chainMap)
      if(res.code === 0){
        this.websocketsvc.linxchain(linx.userid,this._user?.userid! , this._user?.account!, linx , chain)
        console.log('ENCADENADXS !!! on acceptUnion - interactions ', res.message)
        this.dumpInteractionChainInvitation(chain.chainid)   
      }else{
        console.log('ERROR on acceptUnion - interactions ', res.error)
      }
    } catch (error) {
      console.log('ERROR on acceptUnion - interactions ', error)
    }
  }

  async rejectUnion(chain : {chainid : string , chainname : string}){
    try {
      
    } catch (error) {
      
    }
  }

  dumpInteractionChainInvitation(chainid : string){
    const index = this.interactions.chainInvitations?.findIndex(inter => inter.chain.chainid === chainid)

    if(index !== -1){
      this.interactions.chainInvitations?.splice(index! , 1)
    }
  }

  goToProfile(profile: IAccount) {
    this.signalStorageSvc.StoreCandidateData(null);
    this.isOpen.set(false);
    this.signalStorageSvc.StoreLinxData(profile);
    this.router.navigateByUrl(`/Linx/Profile/${profile.linxname}`);
  }

  showUnMatchAlert(isOpen : boolean, userid : string){
    this.setUnMatchAlertOpen[userid] = isOpen;
    this.signalOpenUnMatchAlert.set(this.setUnMatchAlertOpen);
  }

  showChainInvitationAlert(isOpen : boolean, chainid : string){
    this.setChainInvitationAlertOpen[chainid] = isOpen;
    this.openChainInvitationAlert.set(this.setChainInvitationAlertOpen);
  }
  async unMatch(matchuserid : string){
    try {
      const res = await this.restSvc.unMatch(this._user?.userid! , matchuserid)
      if(res.code === 0){
       console.log('Undone Match : ', res.message)
       const delindex = this.interactions.matchingAccounts?.findIndex(acc => acc.userid === matchuserid)
       if (delindex !== -1 && delindex !== undefined) {
        this.interactions.matchingAccounts?.splice(delindex, 1);
      }  
      }else{
        console.log('Error undoing match ....', res.error)
      }
    } catch (error) {
      console.log('Error undoing match ....', error)
    }
  }

  getMatches(){
    try {
        this.myMatches = this.signalStorageSvc.RetrieveMatchesAccounts()();
    } catch (error) {
      console.log('interactions MATCHES never found...', error)
    }
  }

  async getJoinChainRequests(){
    try {
      // aqui me interesan las accounts que me los están pidiendo a mí
      const res = await this.restSvc.getJoinChainRequests(this._user?.userid!);
      if(res.code === 0){
        const requestingaccounts = res.others.accounts;
        const chainreques = res.others.reqs;
        const articles = res.others.articles;
        console.log('MY JOIN Chains Invitations at interactions : ', res.others)
        return {accounts : requestingaccounts , requests : chainreques , articles : articles};
      }else{
        console.log('interactions JOINCHAIN REQS never found...', res.message)
        return null;
      }
    } catch (error) {
       console.log('interactions JOINCHAIN REQS never found...', error)
       return null;
    }
  }

  getNewOnChains (){
    const tenDaysAgo = new Date(this.currentDate);
    tenDaysAgo.setDate(this.currentDate.getDate() - 10);
    const myLinxs = this.signalStorageSvc.RetrieveMyLinxs()()!;
    
    const linxson = this._user?.account.myLinxs;

    let filteredLinxs = linxson?.filter(c => {
                          const date = new Date(c.chainedAt)
                          return date <= tenDaysAgo;
                        });

    const linxsUserIds = filteredLinxs?.map(c => c.userid);

    const newOnChains = myLinxs?.filter(acc => linxsUserIds?.includes(acc.userid));

    return newOnChains;    
  }

  async getMyInteractions() {
    this.getMatches();
    if(this.myMatches !== null){
      this.myMatches.forEach(element => {
        this.interactions.matchingAccounts!.push(element);
      });
    }

    const joinChainInvitations = await this.getJoinChainRequests();

    const reqaccounts : IAccount[]= joinChainInvitations?.accounts!;
    const accountsarticles : IArticle[] = joinChainInvitations?.articles;
    const wholeRequestingAccounts = this.utilsvc.putArticleObjectsIntoAccounts(reqaccounts , accountsarticles)
    
    this.joinChainReqs = joinChainInvitations?.requests;

    this.joinChainReqs.forEach(req => {
      wholeRequestingAccounts.forEach(acc => {
        if(req.requestingUserid === acc.userid){
          let dateOfReq = req.requestedAt;
          const dateType = new Date(dateOfReq);
          const differenceInTime = this.currentDate.getTime() - dateType.getTime();
          const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
          const invitation : IChainInvite = {fromaccount : acc , touserid : req.requestedUserid, daysOfRequest : differenceInDays , chain : { chainid : req.chain.chainid, chainname : req.chain.chainname}}
          this.interactions.chainInvitations!.push(invitation);
        }
      })      
    })

    const newOnChains = this.getNewOnChains()
    newOnChains?.forEach(element => {
      this.interactions.chainedAccounts?.push({account : element , chain : {chainid : '',chainname : ''}})
    })
  }

  async ngOnInit(): Promise<void> {
    this._user = this.signalStorageSvc.RetrieveUserData()();
    await this.getMyInteractions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
