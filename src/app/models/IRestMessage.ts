
export interface IRestMessage {
    code: number,
    message: string,
    error? : string,
    token? : string,
    userdata? : any,
    others?: any 
}