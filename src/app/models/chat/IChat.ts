import { ChatMessage } from "./IMessage";

export interface IChat {
    name : string;
    participants : {userid_a: string; userid_b : string;};
    messages : Array<ChatMessage>;
    roomkey : string;
}