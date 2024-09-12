import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRestMessage } from '../models/IRestMessage';
import { Observable, lastValueFrom } from 'rxjs';

import { ChatMessage, GroupMessage, IMessage } from '../models/chat/IMessage';
import { IUser } from '../models/account/IUser';
import { IArticle } from '../models/account/IArticle';
import { IChain } from '../models/chain/IChain';


@Injectable({
  providedIn: 'root'
})
export class RestnodeService {

  constructor(private _httpClient: HttpClient) { }

  //#region -------------- ACCOUNTS -------------------------------------------

  public trackUserLocationGoogleGeocode(lat: number, long: number): Promise<IRestMessage> {

    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Account/trackLocationGeocode?lat=${lat}&long=${long}`) as Observable<IRestMessage>;
    return lastValueFrom(res);

  }

  public signupNewUser(newuser: IUser): Promise<IRestMessage> {
    const res = this._httpClient.post<IRestMessage>("http://localhost:3000/api/Account/signup",
      newuser,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    )
    return lastValueFrom(res);
  }

  public signin(credentials: { emailorlinxname: string, password: string }): Promise<IRestMessage> {

    const res = this._httpClient.post<IRestMessage>("http://localhost:3000/api/Account/signin",
      credentials,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      });

    return lastValueFrom(res);
  }

  public authenticate(userid: string, jwt: string, password: string): Promise<IRestMessage> {

    const res = this._httpClient.post<IRestMessage>(`http://localhost:3000/api/Account/${userid}/auth`,
      password,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` })
      });

    return lastValueFrom(res);
  }

  public editAccount(userid: string, jwt: string, changes: { linxname: string, email: string }): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Account/${userid}`,
      changes,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` })
      });

    return lastValueFrom(res);
  }

  public deleteAccount(userid: string, jwt: string): Promise<IRestMessage> {
    const res = this._httpClient.delete<IRestMessage>(`http://localhost:3000/api/Account/${userid}`,
      {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${jwt}` })
      });

    return lastValueFrom(res);
  }

  public newArticle(userid: string, article: FormData): Promise<IRestMessage> {
    let url = `http://localhost:3000/api/Account/${userid}/article`;
    const res = this._httpClient.post<IRestMessage>(url, article);
    return lastValueFrom(res);
  }
  public editArticle(userid: string, artid: string, article: FormData): Promise<IRestMessage> {
    let url = `http://localhost:3000/api/Account/${userid}/article/${artid}`;
    const res = this._httpClient.put<IRestMessage>(url, article);
    return lastValueFrom(res);
  }

  public deleteArticle(userid: string, artid: string, filename : string): Promise<IRestMessage> {
    let url = `http://localhost:3000/api/Account/${userid}/article/${artid}?img=${filename}`
    const res = this._httpClient.delete<IRestMessage>(url);
    return lastValueFrom(res);
  }
  
  public deleteArticleImg(userid: string, artid: string, filename : string): Promise<IRestMessage> {
    let url = `http://localhost:3000/api/Account/${userid}/article/${artid}?img=${filename}`
    const res = this._httpClient.delete<IRestMessage>(url);
    return lastValueFrom(res);
  }
  public archiveArticle(userid: string, artid: string, article: IArticle): Promise<IRestMessage> {
    const res = this._httpClient.post<IRestMessage>(`http://localhost:3000/api/Account/${userid}/articlearchive`, article);
    return lastValueFrom(res);
  }
  public getAccountArticles(userid: string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Account/${userid}/articles`);
    return lastValueFrom(res);
  }

  //#endregion

  //#region ------------------------------ PROFILE -----------------------------------------

  public editProfileData(userid: string, data: Object): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Profile/${userid}/data`, data);
    return lastValueFrom(res);
  }

  public editProfilePreferences(userid: string, preferences: Object): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Profile/${userid}/preferences`, preferences);
    return lastValueFrom(res);
  }

  //#endregion

  //#region -------------------------- CONNECTING ----------------------------------------

  public shuffleCandidateProfiles(userid: string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Connection/${userid}/profiles`)
    return lastValueFrom(res);
  }

  public retrieveUserConnections (userid : string) : Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Connection/${userid}`)
    return lastValueFrom(res);
  }

  public requestMatch(userid: string, linxuserid: string): Promise<IRestMessage> {
    const res = this._httpClient.post<IRestMessage>(`http://localhost:3000/api/Connection/${userid}/${linxuserid}`,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })

    return lastValueFrom(res);
  }

  public getPlaceDetails(cityid: string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Account/places/${cityid}`);
    return lastValueFrom(res);
  }
  //#endregion

  //#region ----------------------------- MY CHAIN --------------------------------

  private CHAIN_URL : string = 'http://localhost:3000/api/Chain';

  
  public getMyLinxs(userid: string , chainid : string | null): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`${this.CHAIN_URL}/${userid}/chain/${chainid}`);
    return lastValueFrom(res);
  }

  public createChain(userid : string , chain : IChain) : Promise<IRestMessage> {
    const res = this._httpClient.post<IRestMessage>(`${this.CHAIN_URL}`, {chain, userid});
    return lastValueFrom(res);
  }

  public checkChainNameAvailability( chainname : string) : Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`${this.CHAIN_URL}/${chainname}`);
    return lastValueFrom(res);
  }

  public getChains ( chainids : string[]) : Promise<IRestMessage> {
    const idsParam = chainids.join(","); 
    const route = `${this.CHAIN_URL}?ids=${encodeURIComponent(idsParam)}`; 
  
    const res = this._httpClient.get<IRestMessage>(route);
    return lastValueFrom(res);
  }

  //....... pending review
  
  public getMyChainExtents (userid: string , linxid : string | null) : Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Chain/${userid}/extents/${linxid}`);
    return lastValueFrom(res);
  }

  public requestJoinChain(userid: string, linxuserid: string, chains: Map<string,string>): Promise<IRestMessage> {
    const chainsObject = Object.fromEntries(chains);
    const res = this._httpClient.post<IRestMessage>(`http://localhost:3000/api/Chain/${userid}/${linxuserid}`,
    {chains : chainsObject},
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
    return lastValueFrom(res);
  }

  public getJoinChainRequests(userid: string) : Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Chain/${userid}/chainreqs`);
    return lastValueFrom(res);
  }

  public breakChain(userid: string, linxuserid: string , chainid : string) : Promise<IRestMessage> {
    const res = this._httpClient.delete<IRestMessage>(`http://localhost:3000/api/Chain/${userid}/chain/${chainid}/linx/${linxuserid}`);
    return lastValueFrom(res);
  }

  public rejectJoinChainRequest(userid: string, linxuserid: string, acceptedChainReqs : Array<{chainid : string , accepted : boolean}>): Promise<IRestMessage>  {
    const res = this._httpClient.delete<IRestMessage>(`http://localhost:3000/api/Chain/${userid}/chainreq/${linxuserid}`);
  
    return lastValueFrom(res);
  }

  public getAllUserChainsGroupedByAdmin (userid : string) : Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Chain/${userid}`);
    return lastValueFrom(res);
  }


  //#endregion

  //#region ----------------------------- MY INTERACTIONS ------------------------

  public getMyConnections(userid: string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Connection/${userid}`);
    return lastValueFrom(res);
  }

  public getMatchRoomKey(userid_a: string, userid_b: string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Connection/${userid_a}/${userid_b}/roomkey`);
    return lastValueFrom(res);
  }

  public unMatch(userid: string, matchuserid: string): Promise<IRestMessage> {
    const res = this._httpClient.delete<IRestMessage>(`http://localhost:3000/api/Connection/${userid}/match/${matchuserid}`);
    return lastValueFrom(res);
  }

  //#endregion

  //#region -------------------------------- CHAT ---------------------------------
  public getChats(userid : string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Chat/user/${userid}`);
    return lastValueFrom(res);
  }

  public getChat(roomkey : string): Promise<IRestMessage> {
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/Chat/${roomkey}`);
    return lastValueFrom(res);
  }

  public storeMessage(message: ChatMessage, roomkey: string): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Chat/${roomkey}`,
      message,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })

    return lastValueFrom(res);
  }

  
  public storeGroupMessage(message: GroupMessage, roomkey: string): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Chat/group/${roomkey}`,
      message,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })

    return lastValueFrom(res);
  }

  public markMessagesAsRead(userid : string, roomkey : string): Promise<IRestMessage> {
    const res = this._httpClient.put<IRestMessage>(`http://localhost:3000/api/Chat/${roomkey}/user/${userid}`,{},
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })

    return lastValueFrom(res);
  }
  //#endregion
}
