import { Signal, WritableSignal, signal } from "@angular/core";
import { IUser } from "./account/IUser";
import { IAccount } from "./account/IAccount";
import { IMatch } from "./account/IMatch";
import { IChainGroup } from "./chain/IChainGroup";
import { IAdminGroups } from "./chain/IAdminGroups";


export interface IStorageService {
    //#region ---------------------------- [ SYNC ] --------------------

    StoreUserData (newstate : IUser | null) : void ;
    StoreJWT (jwt : string | null) : void ;

    RetrieveUserData () : WritableSignal<IUser | null> ;
    RetrieveJWT () : Signal<string | null>;

    StoreLinxData (newstate : IAccount| null) : void ;
    RetrieveLinxData () : WritableSignal<IAccount| null> ;

    StoreCandidateData (newstate : IUser | null) : void ;
    RetrieveCandidateData () : WritableSignal<IUser | null> ;

    StoreMatches (matches : IMatch[] | null) : void;
    RetrieveMatches () : WritableSignal<IMatch[] | null>;

    StoreMatchesAccounts (matches : IAccount[] | null) : void;
    RetrieveMatchesAccounts () : WritableSignal<IAccount[] | null>;

    StoreRoomKeys (rooms : Map<string,string> | null) : void ;
    StoreRoomKey (userRoom : {userid : string , roomkey : string}) : void;
    RetrieveRoomKeys () : WritableSignal<Map<string,string> | null>;

    StoreCandidateIndex (index : number) : void;
    RetrieveCandidateIndex() : WritableSignal<number>;

    //#region ---------------NEW AND OLD ----------------

    //NEW : 

    StoreAllUserChainsGroupedByAdmin (admingroups : IAdminGroups[] | null) : void;
    RetrieveAllUserChainsGroupedByAdmin () : WritableSignal<IAdminGroups[] | null>; 

    StoreGroupedLinxsOnMyChains ( chaingroups : IChainGroup[] | null) : void;
    RetrieveGroupedLinxsOnMyChains () : WritableSignal<IChainGroup[] | null>; 

    StoreMyLinxs ( mylinxs : IAccount[] | null) : void;
    RetrieveMyLinxs () : WritableSignal<IAccount[] | null>;

    //#endregion

    //#endregion

    //#region ---------------------------- [ ASYNC ] --------------------


    //#endregion
}