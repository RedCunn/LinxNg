
export interface IMessage {
    sender : {
        userid : string;
        linxname : string;
    };
    to: string;
    text : string;
    timestamp : string;
    _id? : string;
}

export class Message implements IMessage{
    sender: { userid: string; linxname: string; };
    to: string;
    text: string;
    timestamp: string;
    id?: string | undefined;

    constructor(sender : { userid: string; linxname: string; } , to : string , text : string , timestamp : string, _id? : string){
        this.sender = sender;
        this.to = to;
        this.text = text;
        this.timestamp = timestamp;
        this.id = _id;
    }
}

export class ChatMessage extends Message{
    isRead : boolean;

    constructor(isRead : boolean ,sender : { userid: string; linxname: string; } , to : string , text : string , timestamp : string, _id? : string){
        super(sender, to, text, timestamp, _id);
        this.isRead = isRead;
    }
}

export class GroupMessage extends Message{
    readBy : {userid : string , isRead : boolean}[];

    constructor(readBy : {userid : string , isRead : boolean}[] ,sender : { userid: string; linxname: string; } , to : string , text : string , timestamp : string, _id? : string){
        super(sender, to, text, timestamp, _id);
        this.readBy = readBy;
    }
}