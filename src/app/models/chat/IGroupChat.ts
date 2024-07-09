import { IMessage } from "./IMessage";

export interface IGroupChat {
    conversationname : string;
    groupParticipants : Array<{userid : string ; linxname : string}>;
    messages : Array<IMessage>;
    roomkey : string;
}