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
    chains ?: Array<{chainid : string, chainname : string}>;
    linxs ? : Array<{chainIds : string[], userid : string, roomkey : string}>;
}