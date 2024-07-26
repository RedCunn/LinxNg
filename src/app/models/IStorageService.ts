import { Signal, WritableSignal, signal } from "@angular/core";
import { IUser } from "./account/IUser";
import { IAccount } from "./account/IAccount";
import { IConnection } from "./account/IConnection";

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

    StoreConnections(matches : IConnection[] | null) : void;
    RetrieveConnections () : WritableSignal<IConnection[] | null>;

    StoreRoomKeys (rooms : Map<string,string> | null) : void ;
    StoreRoomKey (userRoom : {userid : string , roomkey : string}) : void;
    RetrieveRoomKeys () : WritableSignal<Map<string,string> | null>;

    StoreCandidateIndex (index : number) : void;
    RetrieveCandidateIndex() : WritableSignal<number>;

    //#region ---------------NEW AND OLD ----------------

    //NEW : 

    StoreMyLinxs ( mylinxs : IAccount[] | null) : void;
    RetrieveMyLinxs () : WritableSignal<IAccount[] | null>;

    //#endregion

    //#endregion

    //#region ---------------------------- [ ASYNC ] --------------------


    //#endregion
}