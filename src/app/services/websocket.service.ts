import { Injectable, inject } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { IMessage } from '../models/chat/IMessage';
import { Observable } from 'rxjs';
import { IAccount } from '../models/account/IAccount';


const socket: Socket = io("http://localhost:3000")

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {


  constructor() { }

  disconnect() {
    socket.disconnect();
    socket.removeAllListeners();
  }

  connect() {
    socket.connect()
    socket.on('connect', () => { 
      console.log('CONNECTED TO SOCKET ........................') 
    });
  }

  userLogin(accountid : string , linxname : string) {
    socket.emit('userConnected', { accountid , linxname })
  }

  linxConnected () {
    socket.on('linx_connected', (data) => {
      console.log('LINX INNN ', data)
    });
  }

  initUserRoom (userid_key : string) {
    console.log('initializing user room......', userid_key)
    socket.emit("init_user_room", {roomkey : userid_key }, (res: any) => {
      console.log('USER ROOM : ', res.status)
    }
    )
  }

  initChat (key : string){
    console.log('initializing room......', key)
    socket.emit("init_chat", {roomkey : key}, (res: any) => {
      console.log('RES OK : ', res.status)
    }
    )
  }

  requestInitChat(touserid : string, fromuserid : string, roomkey : string){
    console.log('requesting initialize room with ....', touserid)
    socket.emit("req_init_chat", {touserid,fromuserid, roomkey}, (res: any) => {
      console.log('RES OK : ', res.status)
    }
    )
  }

  getChatRequests(){
    return new Observable<{roomkey : string , userid : string}>(observer => {
      const messageHandler = (data : {roomkey : string , userid : string}) => {
        console.log('socketsvc req_chat: ', data.userid);
        observer.next(data);
      };  
      socket.on('chat_req', messageHandler);
    })  
  }

  sendMessage( message : IMessage, roomkey : string) {
    socket.emit("chat_message", {message, roomkey}, (res: any) => {
      console.log('RES OK : ', res.status)
    }
    )
  }
  getMessages() {
    return new Observable<IMessage>(observer => {
      const messageHandler = (data: IMessage) => {
        console.log('socketsvc get_message: ', data);
        observer.next(data);
      };
  
      socket.on('get_message', messageHandler);
    })  
  };

  markMessageAsRead (message : IMessage , userid : string, senderid : string){
    console.log('MESSAGE TO MARK : ', message)
      socket.emit("messageRead", {message , userid, senderid}, (res: any) => {
        console.log('RES OK : ', res.status)
      }
    )
  }

  getReadMessages(){
    return new Observable<IMessage>(observer => {
      const messageHandler = (data: IMessage) => {
        console.log('socketsvc get_your_message_read: ', data);
        observer.next(data);
      };
      socket.on('get_your_message_read', messageHandler);
    })   
  }

  getInteractions(){
    //Full Match , New Event , On Chain , Broken Chain
    let obs = new Observable<{type : string , from : IAccount , element? : {chainid : string , chainname : string} }>(observer => {
      socket.on('get_interaction', (data) => {
        observer.next(data);
      });
    })

    return obs;
  }

  linxmatch(to_userid : string,from_userid : string , from_user : IAccount, to_user : IAccount) {
    socket.emit('full_match', {to_userid, from_userid, to_user, from_user}, (res : any) => {
      console.log('RES OK : ', res.status)
    })
  }
  linxchain(to_userid : string,from_userid : string , from_user : IAccount, to_user : IAccount , chain : {chainid : string, chainname : string}) {
    socket.emit('on_chain', {to_userid, from_userid, to_user, from_user, chain}, (res : any) => {
      console.log('RES OK : ', res.status)
    })
  }
  linxreqchain(to_userid : string,from_userid : string , from_user : IAccount, to_user : IAccount, chains : Map<string,string>) {
    const chainsObject = Object.fromEntries(chains);
    socket.emit('on_req_chain', {to_userid, from_userid, to_user, from_user, chains : chainsObject}, (res : any) => {
      console.log('RES OK : ', res.status)
    })
  }
  linxreject_reqchain(to_userid : string,from_userid : string , from_user : IAccount, to_user : IAccount, chain : {chainid : string, chainname : string}) {
    socket.emit('on_reject_req_chain', {to_userid, from_userid, to_user, from_user, chain}, (res : any) => {
      console.log('RES OK : ', res.status)
    })
  }
  linxbrokechain(to_userid : string,from_userid : string , from_user : IAccount, to_user : IAccount, chain : {chainid : string, chainname : string}) {
    socket.emit('broken_chain', {to_userid, from_userid, to_user, from_user, chain}, (res : any) => {
      console.log('RES OK : ', res.status)
    })
  }

  newEventOnChain() {
    socket.on('new_event', () => {

    })
  }
}
