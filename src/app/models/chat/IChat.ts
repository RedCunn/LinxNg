import { IMessage } from "./IMessage";

export interface IChat {
    conversationname : string;
    participants : {userid_a: string; userid_b : string;};
    messages : Array<IMessage>;
    roomkey : string;
}