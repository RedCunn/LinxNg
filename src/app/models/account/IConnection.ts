import { IAccount } from "./IAccount";

export interface IConnection {
    connectedAt : string;
    active? : boolean;
    roomkey : string;
    account : IAccount;
}