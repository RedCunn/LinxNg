import { inject, Injector } from "@angular/core"
import { IUser } from "../../../../../models/account/IUser";
import { FORMGROUP_TOKEN, USER_TOKEN } from "./constants";
import { FormGroup } from "@angular/forms";


export const createUserInjectorFn = () => {
    const injector = inject(Injector);

    return (user : IUser) => Injector.create({
        providers : [{provide : USER_TOKEN, useValue : user}],
        parent : injector
    })
}

export const createFormgroupInjectorFn = () => {
    const injector = inject(Injector);

    return (formgroup : FormGroup) => Injector.create({
        providers : [{provide : FORMGROUP_TOKEN, useValue : formgroup}],
        parent : injector
    })
}