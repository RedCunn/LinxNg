import { IChain } from "../chain/IChain";
import { IAccount } from "./IAccount";
import { IConnection } from "./IConnection";

export interface IChainInvite {
    id : string;
    date: string;
    type: "INVITE";
    fromAccount: IAccount;
    toUserId: string;
    chain: { chainid: string, chainname: string };
    state: "REFUSED" | "ACCEPTED" | "PENDING";
}

export interface INewOnChain {
    id : string;
    date: string;
    type: "ONCHAIN";
    account: IAccount;
    chain: IChain;
}

export interface IUserOffChain {
    id : string;
    date: string;
    type: "OFFCHAIN";
    userid : string;
    linxname: string;
    chain?: IChain;
}

export interface INewConnection {
    id : string;
    date: string;
    type: "CONNECTION";
    connection: IConnection;
    account?: IAccount;
}

export type Interaction = 
    INewConnection | 
    IChainInvite | 
    INewOnChain | 
    IUserOffChain;
