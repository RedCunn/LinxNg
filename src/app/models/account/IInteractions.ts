import { IChain } from "../chain/IChain";
import { IAccount } from "./IAccount";
import { IConnection } from "./IConnection";


export interface IInteraction {
    id: string;
    date: string;
    type: string;
    fromAccount: IAccount;
    toUserId: string;
}

export class Interaction implements IInteraction {
    id: string;
    date: string;
    type: string;
    fromAccount: IAccount;
    toUserId: string;

    constructor(
        id: string,
        date: string,
        type: string,
        fromAccount: IAccount,
        toUserId: string
    ) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.fromAccount = fromAccount;
        this.toUserId = toUserId;
    }
}

export class ChainInvite extends Interaction {
    chain: { chainid: string, chainname: string };
    state: "REFUSED" | "ACCEPTED" | "PENDING";

    constructor(
        id: string,
        date: string,
        fromAccount: IAccount,
        toUserId: string,
        chain: { chainid: string, chainname: string },
        state: "REFUSED" | "ACCEPTED" | "PENDING"
    ) {
        super(id, date, "INVITE", fromAccount, toUserId);
        this.chain = chain;
        this.state = state;
    }
}

export class NewOnChain extends Interaction {
    chain: IChain;

    constructor(id: string,
        date: string,
        fromAccount: IAccount,
        toUserId: string,
        chain: IChain) {
        super(id, date, "ONCHAIN", fromAccount, toUserId);
        this.chain = chain;

    }
}

export class OffChain extends Interaction {
    chain: IChain;
    linxname: string;

    constructor(id: string,
        date: string,
        fromAccount: IAccount,
        toUserId: string,
        chain: IChain,
        linxname : string
    ) {
        super(id, date, "OFFCHAIN", fromAccount, toUserId);
        this.chain = chain;
        this.linxname = linxname;
    }
}


export class NewConnection extends Interaction  {
    
    connection: IConnection;

    constructor(id: string,
        date: string,
        fromAccount: IAccount,
        toUserId: string,
        connection : IConnection
    ) {
        super(id, date, "CONNECTION", fromAccount, toUserId);
        this.connection = connection;
    }
    
}

export type Interactions =
    NewConnection |
    ChainInvite |
    NewOnChain |
    OffChain;
