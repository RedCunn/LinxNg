
import { IAccount } from "../account/IAccount";
import { IChainExtents } from "./IChainExtents";

export interface IChainGroup {
    chainid : string;
    chainname : string;
    createdAt? : string ; 
    linxsOnChain : IAccount[];
    linxExtents : IChainExtents[];
}