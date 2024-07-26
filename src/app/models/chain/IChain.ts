import { IAccount } from "../account/IAccount";


export interface IChain {
    createdAt? : string ; 
    chainAdminsId : string[];
    chainId : string;
    chainName : string;
    accounts : IAccount[];   
}