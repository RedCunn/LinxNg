import { GroupMessage} from "./IMessage";

export interface IGroupChat {
    name : string;
    groupParticipants : Array<{userid : string ; linxname : string}>;
    messages : Array<GroupMessage>;
    roomkey : string;
    chainId : string;
}