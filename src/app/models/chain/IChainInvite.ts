import { IAccount } from "../account/IAccount";

export interface IChainInvite {
    fromaccount : IAccount;
    touserid : string;
    daysOfRequest :number;
    chain : {chainid : string , chainname : string};
}