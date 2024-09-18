import { IChain } from "../chain/IChain";
import { IAccount } from "./IAccount";
import { IConnection } from "./IConnection";


export interface IInteraction {
    id: string;
    date: string;
    type: string;
    from: IAccount;
    to: string;
    checked : boolean;
    object : any;
}

export class Interaction implements IInteraction {
    id: string;
    date: string;
    type: string;
    from: IAccount;
    to: string;
    checked : boolean;
    object : any;

    constructor(
        id: string,
        date: string,
        type: string,
        from: IAccount,
        to: string,
        checked : boolean,
        object : any
    ) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.from = from;
        this.to = to;
        this.checked = checked;
        this.object = object;
    }
}

export class ChainInvite extends Interaction {
    chain: IChain;
    state: "REFUSED" | "ACCEPTED" | "PENDING";

    constructor(
        id: string,
        date: string,
        from: IAccount,
        to: string,
        checked : boolean,
        chain : IChain,
        state: "REFUSED" | "ACCEPTED" | "PENDING"
    ) {
        super(id, date, "INVITE", from, to, checked, { chain, state }); 
        this.chain = chain;
        this.state = state;
    }
}

export class NewOnChain extends Interaction {
    chain: IChain;

    constructor(id: string,
        date: string,
        from: IAccount,
        to: string,
        checked : boolean,
        chain: IChain) {
        super(id, date, "ONCHAIN", from, to, checked, chain);
        this.chain = chain;

    }
}

export class OffChain extends Interaction {
    chain: IChain;
    linxname: string;

    constructor(id: string,
        date: string,
        from: IAccount,
        to: string,
        checked : boolean,
        chain: IChain,
        linxname : string
    ) {
        super(id, date, "OFFCHAIN", from, to, checked, {chain , linxname});
        this.chain = chain;
        this.linxname = linxname;
    }
}


export class NewConnection extends Interaction  {
    
    connection: IConnection;

    constructor(id: string,
        date: string,
        from: IAccount,
        to: string,
        checked : boolean,
        connection : IConnection
    ) {
        super(id, date, "CONNECTION", from, to, checked, connection);
        this.connection = connection;
    }
    
}

export type Interactions =
    NewConnection |
    ChainInvite |
    NewOnChain |
    OffChain;
