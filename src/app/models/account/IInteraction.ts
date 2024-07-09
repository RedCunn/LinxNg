import { IChainInvite } from "../chain/IChainInvite";
import { IAccount } from "./IAccount";

export interface IInteraction {
    matchingAccounts? : Array<IAccount>;
    chainedAccounts? : Array<{account : IAccount , chain : {chainid : string , chainname : string}}>;
    refusedInvitations? : Array<{account : IAccount , chain : {chainid : string , chainname : string}}>;
    chainInvitations? : Array<IChainInvite>;
    brokenChains? : Array<{user : string , chain : string}>;
}