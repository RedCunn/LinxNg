import { IAccount } from "../account/IAccount";


export interface IChain {
    createdAt? : string ; 
    chainAdminsID : string[];
    chainID : string;
    chainName : string;
    accounts : IAccount[];   
}