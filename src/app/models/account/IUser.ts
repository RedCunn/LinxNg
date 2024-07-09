import { IAccount } from "./IAccount";

export interface IUser {
    userid : string;
    accountid : string;
    name : string;
    lastname : string;
    preferences : {
        ageRange : {
            fromAge : number;
            toAge : number;
        };
        genders : string [];
        proxyRange : string;
        sharePolitics: string;
        shareDiet : boolean;
        languages : string [];
        shareIndustry : string;
    };
    account : IAccount;
    birthday: string;
    gender : string;
    geolocation : {
        country_id : string;
        city_id : string;
        area1_id : string;
        area2_id : string;
        global_code : string;
    };
    politics: string;
    diet : string;
    languages : string [];
    work : {
        industry: string;
        other?: String;
    }
}