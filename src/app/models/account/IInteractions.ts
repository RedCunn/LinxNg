import { IChain } from "../chain/IChain";
import { IAccount } from "./IAccount";
import { IConnection } from "./IConnection";


export interface IInteraction {
    id: string;
    date: string;
    type: string;
    from: IAccount;
    to: string;
}

export class Interaction implements IInteraction {
    id: string;
    date: string;
    type: string;
    from: IAccount;
    to: string;

    constructor(
        id: string,
        date: string,
        type: string,
        from: IAccount,
        to: string
    ) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.from = from;
        this.to = to;
    }
}

export class ChainInvite extends Interaction {
    chain: { chainid: string, chainname: string };
    state: "REFUSED" | "ACCEPTED" | "PENDING";

    constructor(
        id: string,
        date: string,
        from: IAccount,
        to: string,
        chain: { chainid: string, chainname: string },
        state: "REFUSED" | "ACCEPTED" | "PENDING"
    ) {
        super(id, date, "INVITE", from, to);
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
        chain: IChain) {
        super(id, date, "ONCHAIN", from, to);
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
        chain: IChain,
        linxname : string
    ) {
        super(id, date, "OFFCHAIN", from, to);
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
        connection : IConnection
    ) {
        super(id, date, "CONNECTION", from, to);
        this.connection = connection;
    }
    
}

export type Interactions =
    NewConnection |
    ChainInvite |
    NewOnChain |
    OffChain;
