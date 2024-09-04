import { IAccount } from "../account/IAccount";


export interface IChain {
    createdAt? : string ; 
    active : boolean;
    chainAdminsId : string[];
    chainId : string;
    chainName : string;
    accounts : IAccount[];   
}