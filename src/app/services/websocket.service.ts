import { Injectable, inject } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { ChatMessage, GroupMessage, IMessage } from '../models/chat/IMessage';
import { Observable, Subject } from 'rxjs';
import { IAccount } from '../models/account/IAccount';


const socket: Socket = io("http://localhost:3000")

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private userConnectedSubject = new Subject<string>();
  private userDisconnectedSubject = new Subject<string>();

  constructor() { 
    socket.on('user_connected', (data) => {
      this.userConnectedSubject.next(data);
    });

    socket.on('user_disconnected', (data) => {
      this.userDisconnectedSubject.next(data);
    });
  }

  userConnected$() {
    return this.userConnectedSubject.asObservable();
  }

  userDisconnected$() {
    return this.userDisconnectedSubject.asObservable();
  }

  disconnect(userid : string , roomkeys : string[]) {
    socket.disconnect();
    socket.emit('userDisconnected', {userid , roomkeys})
    socket.removeAllListeners();
  }

  connect() {
    socket.connect()
    socket.on('connect', () => { 
      console.log('CONNECTED TO SOCKET ........................') 
    });
  }

  pingUsers(userid : string, userids : string[]){
    socket.emit('ping_users',{userid, userids})
  }

  userPong(){
    return new Observable<string>(observer => {
      const responseHandler = (userid : string) => {
        observer.next(userid);
      };  
      socket.on('user_pong', responseHandler); 

      return () => {
        socket.off('user_pong', responseHandler);
      };

    });
  }

  userLogin(userid : string , roomkeys : string[]) {
    socket.emit('userConnected', { userid , roomkeys})
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

  sendMessage( message : ChatMessage | GroupMessage, roomkey : string) {
    socket.emit("chat_message", {message, roomkey}, (res: any) => {
      console.log('RES OK : ', res.status)
    }
    )
  }
  getMessages() : Observable<ChatMessage | GroupMessage>  {
    return new Observable< ChatMessage | GroupMessage>(observer => {
      const messageHandler = (data:  ChatMessage | GroupMessage) => {
        observer.next(data);
      };
      socket.on('get_message', messageHandler);
    })  
  };


  userReadMessages(userid : string , roomkey : string, chatopen : boolean){
      socket.emit("readMessages", {userid,roomkey, chatopen}, (res: any) => {
        console.log('RES OK : ', res.status)
      }
    )
  }
  markMessagesAsRead(){
    return new Observable<{roomkey : string, userid : string, read : boolean }>(observer => {
      const messageHandler = (data: {roomkey : string, userid : string, read : boolean }) => {
        observer.next(data);
      };

      socket.on('readingMessages', messageHandler);
    });
  }
  
  markMessageAsRead (message :  ChatMessage | GroupMessage , userid : string, senderid : string){
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
  //Full Connection, Chain Invite , Chain invite Accepted, Chain invite Rejected, New onChain , New offChain
  getInteractions(){
    let obs = new Observable<{type : string , from : IAccount , element? : {chainid : string , chainname : string} }>(observer => {
      socket.on('get_interaction', (data) => {
        observer.next(data);
      });
    })
    return obs;
  }

  doConnection(from_user : IAccount, to_user : IAccount) {
    socket.emit('full_connection', {to_user, from_user}, (res : any) => {
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
