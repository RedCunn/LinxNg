
export interface IMessage {
    isRead : boolean;
    sender : {
        userid : string;
        linxname : string;
    };
    text : string;
    timestamp : string;
    _id? : string;
}