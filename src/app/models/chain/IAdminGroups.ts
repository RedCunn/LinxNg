import { IAccount } from "../account/IAccount";


export interface IAdminGroups {
    chainadminID : string;
    chainID : string;
    chainName : string;
    accounts : IAccount[];   
}