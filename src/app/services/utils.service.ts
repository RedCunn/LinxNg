import { Injectable, inject } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { SignalStorageService } from './signal-storage.service';
import * as CryptoJS from 'crypto-js';
import { RestnodeService } from './restnode.service';
import { IAccount } from '../models/account/IAccount';
import { IArticle } from '../models/account/IArticle';
import { IUser } from '../models/account/IUser';
import { IChainGroup } from '../models/chain/IChainGroup';
import { IInteraction } from '../models/account/IInteraction';
import { IMatch } from '../models/account/IMatch';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private socketSvc: WebsocketService = inject(WebsocketService);
  private signalSvc: SignalStorageService = inject(SignalStorageService);
  private restsvc : RestnodeService = inject(RestnodeService);
  private currentDate: Date = new Date();

  constructor() { }

  public putArticleObjectsIntoAccounts(accounts: IAccount[], articles: IArticle[]): IAccount[] {
    let articlesByUserid: { [key: string]: IArticle[] } = {};
    let wholeAccounts = accounts;

    articles.forEach(art => {
      if (!articlesByUserid[art.userid!]) {
        articlesByUserid[art.userid!] = [];
      }
      articlesByUserid[art.userid!].push(art);
    })

    wholeAccounts.forEach(acc => {
      if (acc.articles && acc.articles.length > 0) {
        acc.articles = [];
        acc.articles = articlesByUserid[acc.userid] || [];
        const profilePicArticleIndex = articlesByUserid[acc.userid].findIndex(article => article.useAsProfilePic === true);
        if (profilePicArticleIndex !== -1) {
          const profilePicArticle = acc.articles.splice(profilePicArticleIndex, 1)[0];
          acc.articles.unshift(profilePicArticle);
        }
      }
    })
    return wholeAccounts;
  }

  public joinRoom (room :{userid : string , roomkey : string}){
    this.socketSvc.initChat(room.roomkey);
    const storedkeys = new Map<string, string>(this.signalSvc.RetrieveRoomKeys()());
    storedkeys.set(room.userid , room.roomkey);
    this.signalSvc.StoreRoomKey(room)
  }

  public joinRooms(userRooms: Map<string, string>): void {
    for (const [key, value] of userRooms) {
      this.socketSvc.initChat(value);
    }
    this.signalSvc.StoreRoomKeys(userRooms);
  }

  public integrateAccountsIntoUsers(accounts: IAccount[], users: IUser[]): IUser[] {
    const userMap = new Map<string, IUser>();

    users.forEach(user => {
      userMap.set(user.userid, user);
    });

    accounts.forEach(acc => {
      const user = userMap.get(acc.userid);
      if (user) {
        user.account = acc;
      }
    });

    return Array.from(userMap.values());

  }

  groupMyLinxsOnChains (userdata : IUser , myLinxs : IAccount[]) :Array<IChainGroup>{
    
    const linxMap: Map<string, IAccount> = new Map();
  
    let myChainGroups : Array<IChainGroup> = [];

    // Inicializo las cadenas 
    userdata.account.myChains?.forEach(chain => {
      myChainGroups.push({ chainid: chain.chainid, chainname: chain.chainname, createdAt: chain.createdAt, linxsOnChain: [] , linxExtents : [] });
    });
  
    myLinxs.forEach(linx => {
      linxMap.set(linx.userid, linx);
    });
  
    // Agrupo lxs linxs en las cadenas correspondientes
    userdata.account.myLinxs?.forEach(linx => {
      const chain = myChainGroups.find(chain => chain.chainid === linx.chainid);
      const linxData = linxMap.get(linx.userid);
  
      if (chain && linxData) {
        chain.linxsOnChain.push(linxData);
      }
    });

    return myChainGroups;
  }

  groupLinxsInSharedChains (userdata : IUser , linxdata : IAccount) : Array<IChainGroup>{

    let myLinxs : IAccount[] = this.signalSvc.RetrieveMyLinxs()()!;
    let chainIDs : Set<string> = new Set<string>();
    let linxMap :  Map<string, string> = new Map<string,string>();

    let sharedChainsGroups : Array<IChainGroup> = [];

    // Recojo los chainids que compartimos este Linx y yo
    userdata.account.myLinxs?.forEach(li => {
      if(li.userid === linxdata.userid){
        chainIDs.add(li.chainid)
      }
    })

    // Almaceno las cadenas compartidas 
    sharedChainsGroups = userdata.account.myChains
    ?.filter(chain => chainIDs.has(chain.chainid))
    .map(chain => ({ chainid: chain.chainid, chainname: chain.chainname, linxsOnChain: [] , linxExtents : []})) || [];

    // Mapeao cada linx con su chainid 
    userdata.account.myLinxs?.forEach(linx => {
      if (chainIDs.has(linx.chainid)) {
        linxMap.set(linx.userid, linx.chainid);
      }
    });

    //Añado las cuentas completas de les linxs a las cadenas compartidas
    myLinxs.forEach(linx => {
      const chainid = linxMap.get(linx.userid);
      if (chainid) {
        const index = sharedChainsGroups.findIndex(cha => cha.chainid === chainid);
        if (index !== -1) {
          sharedChainsGroups[index].linxsOnChain.push(linx);
        }
      }
    });

    return sharedChainsGroups;
  }


  public mapCandidateProfileDataToLegible(profile: IUser): Map<string, string> {
    const attributesMap = new Map<string, string>();

    const birthday = new Date(profile.birthday);
    const yearsOld = this.currentDate.getFullYear() - birthday.getFullYear();

    attributesMap.set('years', yearsOld.toString());

    const dietValue = profile.diet;
    let diet = '';
    switch (dietValue) {
      case "vegan":
        diet = "veganx";
        break;
      case "vegetarian":
        diet = "vegetarianx";
        break;
      case "omnivore":
        diet = "omnivorx";
        break;
      default:
        break;
    }

    attributesMap.set('diet', diet)

    const genderValue = profile.gender;
    let gender = '';

    switch (genderValue) {
      case 'woman':
        gender = 'mujer';
        break;
      case 'fluid':
        gender = 'fluido';
        break;
      case 'nonbin':
        gender = 'no binarie';
        break;
      case 'man':
        gender = 'hombre';
        break;
      default:
        break;
    }

    attributesMap.set('gender', gender)

    const politicsValue = profile.politics;
    let politics = '';
    switch (politicsValue) {
      case 'some-left':
        politics = 'en algún lugar a la izquierda';
        break;
      case 'some-right':
        politics = 'en algún lugar a la derecha';
        break;
      case 'libe-left':
        politics = 'izquierda libertaria';
        break;
      case 'libe-right':
        politics = 'derecha libertaria';
        break;
      case 'autho-left':
        politics = 'izquierda autoritaria';
        break;
      case 'autho-right':
        politics = 'derecha autoritaria';
        break;
      case 'center':
        politics = 'centrocampista';
        break;
      case 'none':
        politics = 'apolítica';
        break;
      default:
        break;
    }

    attributesMap.set('politics', politics)

    const work = profile.work.industry + ' ' + profile.work.other

    attributesMap.set('work', work)

    let langs= '';
    if(profile.languages.length > 1){
      profile.languages.forEach(lang => {
        langs = langs + ', ' + lang
      })
    }else{
      langs = profile.languages[0]
    }
    
    attributesMap.set('langs', langs)

    return attributesMap;
  }

  sortArticlesDateDESC(articles: IArticle[]): IArticle[] {
    const sortedArticles = articles.sort((a, b) => {
      const dateA = new Date(a.postedOn);
      const dateB = new Date(b.postedOn);
      return dateB.getTime() - dateA.getTime();
    });
    return sortedArticles;
  }

  sortInteractionsDateDESC(interactions : IInteraction[]){
    
  }

  formatDateISOStringToLegible(date: string) {

    let legibleDate = '';
    const dateObj = new Date(date);

    if (dateObj.getFullYear() === this.currentDate.getFullYear() &&
      dateObj.getMonth() === this.currentDate.getMonth() &&
      dateObj.getDate() === this.currentDate.getDate()) {
      return 'Hoy';
    } else {
      const yesterday = new Date(this.currentDate);
      yesterday.setDate(this.currentDate.getDate() - 1);

      if (dateObj.getFullYear() === yesterday.getFullYear() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getDate() === yesterday.getDate()) {
        return 'Ayer';
      }
    }

    legibleDate = dateObj.getDate().toString() + ' del ' + (dateObj.getMonth() + 1).toString() + ' de ' + dateObj.getFullYear().toString()

    return legibleDate;
  }

  dateAndHoursISOStringToLegible(date: string) {
    let legibleDate = '';
    let todayYestarday = false;
    const dateObj = new Date(date);
    const dateMonth = dateObj.getMonth();
    const dateYear = dateObj.getFullYear();
    const dateDate = dateObj.getDate();
    const dateDay = dateObj.getDay();

    const weekdays: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months : string[] = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

    if (dateYear === this.currentDate.getFullYear() &&
      dateMonth === this.currentDate.getMonth() &&
      dateDate === this.currentDate.getDate()) {
      legibleDate = 'Hoy a las ';
      todayYestarday = true;
    }
    const yesterday = new Date(this.currentDate);
    yesterday.setDate(this.currentDate.getDate() - 1);

    if (dateYear === yesterday.getFullYear() &&
      dateMonth === yesterday.getMonth() &&
      dateDate === yesterday.getDate()) {
      legibleDate = 'Ayer a las ';
      todayYestarday = true;
    }

    const isThisWeek = this.isSameWeek(dateObj)

    if(isThisWeek && !todayYestarday){
      legibleDate = weekdays[dateDay] + ' a las '
    }
    
    if(!todayYestarday && !isThisWeek){
      let dateString = dateDate.toString()
        let monthString = months[dateMonth]
        if(dateDate < 10){
          dateString = '0'+dateString
        }
      if (this.currentDate.getFullYear() > dateYear) {
        legibleDate = dateString + ' de ' + monthString +' de '+ dateYear.toString() + ' a las '
      } else {
        legibleDate = dateString + ' de ' + monthString + ' a las ' 
      }
    }

    let hour = dateObj.getHours()
    let hourString = hour.toString();
    let minutes = dateObj.getMinutes()
    let minutesString = minutes.toString()
    if (minutes < 10) {
      minutesString = ':0' + minutesString
    } else {
      minutesString = ':' + minutesString
    }

    legibleDate = legibleDate + hourString + minutesString

    return legibleDate;
  }

  isSameWeek(date: Date) {
    const startOfWeek = (date: Date) => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const start  = new Date(date.setDate(diff));
      start.setHours(0, 0, 0, 0); 
      return start;
    };

    const startOfThisWeek = startOfWeek(new Date(this.currentDate.getTime()));
    const dateStartOfWeek = startOfWeek(new Date(date.getTime()));

    return startOfThisWeek.getFullYear() === dateStartOfWeek.getFullYear() &&
      startOfThisWeek.getMonth() === dateStartOfWeek.getMonth() &&
      startOfThisWeek.getDate() === dateStartOfWeek.getDate();
  }

  findUserIndexOnMatches(matches: IMatch[] | null, userid: string, id: string): number {
    if (matches !== null) {
      const index = matches.findIndex(m => (m.userid_a === userid && m.userid_b === id) || (m.userid_a === id && m.userid_b === userid))
      return index;
    }
    return -1;
  }

  generateRoomkey () : string {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    const roomkey = CryptoJS.enc.Hex.stringify(randomBytes);
    return roomkey;
  }

  setRoomKey(userid : string , id : string): string {
    const storedrooms = this.signalSvc.RetrieveRoomKeys()() !== null ? this.signalSvc.RetrieveRoomKeys()() : new Map<string,string>();
    
    if(!storedrooms?.has(id)){
      const roomkey =  this.generateRoomkey();
      const room = {userid : id, roomkey : roomkey}
      this.signalSvc.StoreRoomKey(room);
      this.socketSvc.requestInitChat(id, userid, roomkey);
      return roomkey;
    }else{
      return storedrooms.get(id)!; 
    }
  }

  async getChainExtents ( userid : string, chainid : string) : Promise<IAccount[]>{

    let extentsAccounts : IAccount[] = [];
    try {
      const res = await this.restsvc.getMyChainExtents(userid , chainid);
      if (res.code === 0) {
        const extaccounts: IAccount[] = res.others as IAccount[];
        const extarticles: IArticle[] = res.userdata as IArticle[];
        const extAccountsButMe = extaccounts.filter(acc => acc.userid !== userid)
        extentsAccounts = this.putArticleObjectsIntoAccounts(extAccountsButMe, extarticles);
      } else {
        console.log('Error gettingExtendedChain utilsvc-userhome : ', res.error);
      }
    } catch (error) {
      console.log('Error gettingExtendedChain utilsvc-userhome :', error);
    }
    return extentsAccounts;
  }

}
