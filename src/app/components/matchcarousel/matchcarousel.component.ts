import { Component, inject, OnInit, signal } from '@angular/core';
import { RestnodeService } from '../../services/restnode.service';
import { SignalStorageService } from '../../services/signal-storage.service';
import { WebsocketService } from '../../services/websocket.service';
import { UtilsService } from '../../services/utils.service';
import { IArticle } from '../../models/account/IArticle';
import { IAccount } from '../../models/account/IAccount';
import { IUser } from '../../models/account/IUser';
import { IRestMessage } from '../../models/IRestMessage';
import { initCarousels } from 'flowbite';
import { Router } from '@angular/router';
import { FlowbiteService } from '../../services/flowbite.service';

@Component({
  selector: 'app-matchcarousel',
  standalone: true,
  imports: [],
  templateUrl: './matchcarousel.component.html',
  styleUrl: './matchcarousel.component.scss'
})
export class MatchcarouselComponent implements OnInit {

  private flowbitesvc = inject(FlowbiteService);
  private restsvc: RestnodeService = inject(RestnodeService);
  private signalStoreSvc: SignalStorageService = inject(SignalStorageService);
  private socketsvc: WebsocketService = inject(WebsocketService);
  private utilsvc : UtilsService = inject(UtilsService);

  public userdata!: IUser | null;
  public candidateProfiles!: IUser[] | null;

  public picArticle! : IArticle;

  public loading = signal(true);
  public currentIndex = signal(0);
  public showAnimation = signal(false);

  constructor(private router: Router) {
    let _userdata = this.signalStoreSvc.RetrieveUserData();
    if (_userdata() !== null) {
      this.userdata = _userdata();
    }
    const index = this.signalStoreSvc.RetrieveCandidateIndex()();
    this.currentIndex.set(index);
  }

  async setCandidateProfiles() {
    try {
      const response: IRestMessage = await this.restsvc.shuffleCandidateProfiles(this.userdata?.userid!);
      console.log('RESPONSE SETTING CANDIDATE PROFILES : ', response)
      if (response.code === 0) {
        
        const _accountsArticles : IArticle[] = response.userdata as IArticle[];
        const _accounts = response.others.accounts as IAccount[];
        if(_accounts.length > 0){
          const wholeAccounts : IAccount[] = this.utilsvc.putArticleObjectsIntoAccounts(_accounts , _accountsArticles)

          const _users = response.others.users as IUser[];
          const wholeUsers : IUser[] = this.utilsvc.integrateAccountsIntoUsers(wholeAccounts , _users);
  
          this.candidateProfiles = wholeUsers;
  
          if(this.candidateProfiles[this.currentIndex()].account.articles !== undefined && this.candidateProfiles[this.currentIndex()].account.articles!.length > 0){
            this.setProfilePicArticle(this.candidateProfiles[this.currentIndex()])
          }
        }else{
          this.candidateProfiles = []; 
        }
        
        this.loading.set(false);
      } else {
        this.loading.set(false);
        this.router.navigateByUrl('/Linx/error');
      }
    } catch (error) {
      this.loading.set(false);
      this.router.navigateByUrl('/Linx/error');
    }
  }

  setProfilePicArticle(candidate : IUser){
    let artindex = candidate.account.articles?.findIndex(art=> art.useAsProfilePic === true)
    if(artindex !== -1){
      this.picArticle = candidate.account.articles![artindex!]
    }else{
      this.picArticle = candidate.account.articles!.at(0)!
    }
  }

  nextProfile() {
    if (this.currentIndex() < this.candidateProfiles?.length! - 1) {
      this.setProfilePicArticle(this.candidateProfiles![this.currentIndex() + 1])
      this.currentIndex.update((i) => i + 1);
      this.signalStoreSvc.StoreCandidateIndex(this.currentIndex())
    } else {
      this.setProfilePicArticle(this.candidateProfiles![0])
      this.currentIndex.set(0);
      this.signalStoreSvc.StoreCandidateIndex(this.currentIndex())
    }

  }
  previousProfile() {
    if (this.currentIndex() > 0) {
      this.setProfilePicArticle(this.candidateProfiles![this.currentIndex() - 1])
      this.currentIndex.update((i) => i - 1);
      this.signalStoreSvc.StoreCandidateIndex(this.currentIndex())
    } else {
      this.setProfilePicArticle(this.candidateProfiles![this.candidateProfiles?.length! - 1])
      this.currentIndex.set(this.candidateProfiles?.length! - 1);
      this.signalStoreSvc.StoreCandidateIndex(this.currentIndex())
    }
  }

  async matchRequest(linx: IUser) {
    try {
      const res = await this.restsvc.requestMatch(this.userdata?.userid!, linx.userid);
      if (res.code === 0) {
        let index = this.candidateProfiles!.findIndex(profile => profile.userid === linx.userid);
        if (index !== -1) {
          this.showAnimation.set(true);
          setTimeout(() => {
            this.showAnimation.set(false);
            this.nextProfile()
            this.candidateProfiles!.splice(index, 1);
          }, 2000);
        }
        console.log('RESPONSE MATCH REQ : ', res)
        if (res.message === 'FULL') {
          this.socketsvc.linxmatch(linx.userid, this.userdata?.userid!, this.userdata?.account!, linx.account);
        }
      } else {
        console.log('RESPONSE ERROR MATCH REQ : ', res)
      }
    } catch (error) {
      console.log('ERROR MATCH REQ : ', error)
    }
  }
  goToLinxProfile(linx : IUser){
    this.signalStoreSvc.StoreCandidateData(linx as IUser);
    this.signalStoreSvc.StoreCandidateIndex(this.currentIndex());
    this.router.navigateByUrl(`/Linx/perfil/${linx.account.linxname}`);
  }
  async ngOnInit(): Promise<void> {
    this.flowbitesvc.loadFlowbite()
    initCarousels();
    await this.setCandidateProfiles();
  }
}

