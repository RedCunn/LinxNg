import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { IStorageService } from '../models/IStorageService';
import { IUser } from '../models/account/IUser';
import { IAccount } from '../models/account/IAccount';
import { IMatch } from '../models/account/IMatch';
import { IChainGroup } from '../models/chain/IChainGroup';
import { IAdminGroups } from '../models/chain/IAdminGroups';

@Injectable({
  providedIn: 'root'
})
export class SignalStorageService implements IStorageService{

  private _userstatesignal : WritableSignal<IUser | null> = signal<IUser | null>(null);
  private _candidatesignal : WritableSignal<IUser | null> = signal<IUser | null>(null);
  private _jwtsignal : WritableSignal<string | null> = signal<string | null>('');
  private _linxstatesignal : WritableSignal<IAccount | null> = signal<IAccount | null>(null);
  private _matchesaccountsignal : WritableSignal<IAccount[] | null> = signal<IAccount[] | null>([]);
  private _matchessignal : WritableSignal<IMatch[] | null> = signal<IMatch[]| null>([]);
  private _roomkeyssignal : WritableSignal<Map<string,string> | null> = signal<Map<string,string> | null>(new Map<string,string>());
  private _candidateindex : WritableSignal<number> = signal<number>(0);

  //NEW : 
  private _mylinxssignal : WritableSignal<IAccount[] | null> = signal<IAccount[] | null>([]);
  private _groupedLinxs : WritableSignal<IChainGroup[] | null> = signal<IChainGroup[] | null>([]);
  private _groupedLinxsByAdmin : WritableSignal<IAdminGroups[] | null> = signal<IAdminGroups[] | null>([]);
  
  constructor() { }
  
  //NEW : 

  StoreAllUserChainsGroupedByAdmin(admingroups: IAdminGroups[] | null): void {
    if(admingroups !== null){
      this._groupedLinxsByAdmin.update((currentstate) => ([...admingroups]))
    }else{
      this._groupedLinxsByAdmin.set(null);
    }
  }
  RetrieveAllUserChainsGroupedByAdmin(): WritableSignal<IAdminGroups[] | null> {
    return this._groupedLinxsByAdmin;
  }
  
  StoreGroupedLinxsOnMyChains(chaingroups: IChainGroup[] | null): void {
    if(chaingroups !== null){
      this._groupedLinxs.update((currentstate) => ([...chaingroups]))
    }else{
      this._groupedLinxs.set(null);
    }
  }
  RetrieveGroupedLinxsOnMyChains(): WritableSignal<IChainGroup[] | null> {
    return this._groupedLinxs;
  }

  StoreMyLinxs(mylinxs: IAccount[] | null): void {
    if(mylinxs !== null){
      this._mylinxssignal.update((currentstate) => ([...mylinxs]))
    }else{
      this._mylinxssignal.set(null);
    }
  }
  RetrieveMyLinxs(): WritableSignal<IAccount[] | null> {
   return this._mylinxssignal;
  }
//-------------------------------------------------------------------
  StoreCandidateIndex(index: number): void {
    this._candidateindex.set(index);
  }
  RetrieveCandidateIndex(): WritableSignal<number> {
    return this._candidateindex;
  }
  StoreCandidateData(newstate: IUser | null): void {
    if(newstate !== null){
      this._candidatesignal.update((currentstate) => ({...currentstate , ...newstate}))
    }else{
      this._candidatesignal.set(null);
    }
  }
  RetrieveCandidateData(): WritableSignal<IUser | null> {
    return this._candidatesignal;
  }
  StoreRoomKeys (rooms : Map<string,string> | null): void {
   
    const currentRooms = this._roomkeyssignal() !== null ? this._roomkeyssignal() : new Map<string,string>();
   
    if(rooms !== null){
      for (const [key , value] of rooms) {
        currentRooms?.set(key , value);
      }
      this._roomkeyssignal.set(currentRooms);
    }else{
      this._roomkeyssignal.set(null);
    }
  }
  StoreRoomKey(userRoom : {userid : string , roomkey : string}): void {
    let keymap = this._roomkeyssignal();
    if(keymap === null){
      keymap = new Map<string,string>();
      keymap.set(userRoom.userid , userRoom.roomkey)
    }else{
      keymap.set(userRoom.userid , userRoom.roomkey)
    }
    this._roomkeyssignal.set(keymap)
  }

  RetrieveRoomKeys(): WritableSignal<Map<string, string> | null> {
    console.log('RETRIEVE ROOMKEYS SIGNAL SVC : ', this._roomkeyssignal())
    return this._roomkeyssignal;
  }
  StoreMatches(matches: IMatch[] | null): void {
    if(matches !== null){
      this._matchessignal.update((currentstate) => ([...matches]))
    }else{
      this._matchessignal.set([]);
    }
  }
  RetrieveMatches(): WritableSignal<IMatch[] | null> {
    return this._matchessignal;
  }
  StoreMatchesAccounts(matches: IAccount[] | null): void {
    if(matches !== null){
      this._matchesaccountsignal.update((currentstate) => ([...matches]))
    }else{
      this._matchesaccountsignal.set([]);
    }
  }
  RetrieveMatchesAccounts(): WritableSignal<IAccount[] | null> {
    return this._matchesaccountsignal;
  }
  

  StoreLinxData(newstate: IAccount | null): void {
    if(newstate !== null){
      this._linxstatesignal.update((currentstate) => ({...currentstate , ...newstate}))
    }else{
      this._linxstatesignal.set(null);
    }
  }

  RetrieveLinxData(): WritableSignal<IAccount | null> {
    return this._linxstatesignal;
  }

  StoreUserData(newstate: IUser | null): void {
    if(newstate !== null){
      this._userstatesignal.update((currentstate) => ({...currentstate , ...newstate}))
    }else{
      this._userstatesignal.set(null);
    }
  }
  StoreJWT(jwt: string | null): void {
   if(jwt !== null){
    this._jwtsignal.set(jwt);
   }else{
    this._jwtsignal.set(null);
   }
  }

  RetrieveUserData(): WritableSignal<IUser | null> {
   return this._userstatesignal;
  }
  
  RetrieveJWT(): Signal<string | null> {
    return this._jwtsignal;
  }

  
  
}
