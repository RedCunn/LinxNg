import { IArticle } from "./IArticle";


export interface IAccount {
    _id? : string;
    userid : string;
    createdAt : string;
    linxname : string;
    email : string;
    password: string;
    active : boolean;
    articles ?: Array<IArticle>;
    myChains ?: Array<{chainid : string, chainname : string, createdAt : string}>;
    myLinxs ? : Array<{chainid : string, userid : string, roomkey : string, chainedAt : string}>;
    linxExtents? : Array<{mylinxuserid : string , userid : string , roomkey : string}>;
}