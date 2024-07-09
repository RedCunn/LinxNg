import { InjectionToken } from "@angular/core";
import { IUser } from "../../../../../models/account/IUser";
import { FormGroup } from "@angular/forms";


export const USER_TOKEN = new InjectionToken<IUser>('user_token');
export const FORMGROUP_TOKEN = new InjectionToken<FormGroup>('formgroup_token');