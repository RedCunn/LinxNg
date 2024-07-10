import { inject, Injector, Signal, WritableSignal } from "@angular/core"
import { IUser } from "../../../../../models/account/IUser";
import { USER_TOKEN } from "./constants";
import { FormGroup } from "@angular/forms";


export const createUserInjectorFn = () => {
    const injector = inject(Injector);

    return (user : IUser) => Injector.create({
        providers : [{provide : USER_TOKEN, useValue : user}],
        parent : injector
    })
}
