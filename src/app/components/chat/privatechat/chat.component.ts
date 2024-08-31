import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { initDropdowns} from 'flowbite';
import { IChat } from '../../../models/chat/IChat';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { WebsocketService } from '../../../services/websocket.service';
import { UtilsService } from '../../../services/utils.service';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { ChatMessage, GroupMessage, IMessage } from '../../../models/chat/IMessage';
import { IUser } from '../../../models/account/IUser';
import { FlowbiteService } from '../../../services/flowbite.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChatComponent implements OnInit, OnDestroy , AfterContentInit{

  @Input() isOpen = signal(false);
  @Input() chatRef!: IChat;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  private flowbitesvc = inject(FlowbiteService);
  private signalStorageSvc = inject(SignalStorageService);
  private restSvc = inject(RestnodeService);
  private socketSvc = inject(WebsocketService);
  private utilsvc = inject(UtilsService);

  public chat : IChat= {name:'', participants: { userid_a: '', userid_b: '' }, messages: [], roomkey: ''};
  public groupChat :  IGroupChat = {name:'', groupParticipants: [], messages: [], roomkey: '', chainId : ''};
  public message: ChatMessage = { isRead : false, text: '', timestamp: '', sender: { userid: '', linxname: '' }, to :''};
  
  public user!: IUser;
  public chatMessages : WritableSignal<ChatMessage[]> = signal([]);
  public chatWasRead = signal(false); 
  private destroy$ = new Subject<void>();
  private messID : string  = '';

  constructor(private ref: ChangeDetectorRef) {

    this.socketSvc.getMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: ChatMessage | GroupMessage) => {
      if(this.isChatMessage(data)){
        console.log('DATA QUE ENTRA EN CHAT : ', data)
        if(this.isOpen() && data.sender.userid !== this.user.userid){
          data.isRead = true;
          this.socketSvc.userReadMessages(this.user.userid, this.chatRef.roomkey)
        }else{
          data.isRead = false;
        }

        if(data.sender.userid !== this.user.userid){
          this.chatMessages.update(mess =>[...mess, data]);
        }
      }
      this.ref.detectChanges();
      this.scrollToBottom();
    });

    this.socketSvc.markMessagesAsRead().pipe(
      takeUntil(this.destroy$)
    ).subscribe((data : {roomkey : string, userid : string, read : boolean }) => {
      if(data.userid !== this.user.userid && data.roomkey === this.chatRef.roomkey && data.read){
        this.chatRef.messages.forEach(message => {
          message.isRead = true;
        })
        const markedMessages : ChatMessage[] = this.chatMessages().map(message => {
          return {...message, isRead : true};
        })
        this.chatMessages.set(markedMessages);
        this.chatWasRead.set(true);
      }else{
        this.chatWasRead.set(false);
      }
    })

    effect(() => {
      if(this.isOpen()){
        this.socketSvc.userReadMessages(this.user.userid, this.chatRef.roomkey)
        this.scrollToBottom();
      }
    })



  }
  
  closeModal() {
    this.isOpen.set(false);
  }

  async markMessagesAsRead(){
    let readMessages : IMessage[] = [];
    this.chatMessages().forEach(mess => {
      if(!mess.isRead && mess.sender.userid !== this.user.userid){
        readMessages.push(mess)
      }
    })
    console.log('messages to update read : ', readMessages)
    try {
      const res = await this.restSvc.markMessagesAsRead(this.user.userid , this.chatRef.roomkey);
      if (res.code === 0) {
        console.log('Messages marked at chatmodal : ', res.message);
        this.chatMessages().forEach(m =>  {
          if(!m.isRead && m.sender.userid !== this.user.userid){
            m.isRead = true;
          }
        })
      } else {
        console.log('Error marking messages at chatmodal :', res.error);
      }
    } catch (error) {
      console.log('Error marking messages at chatmodal :', error);
    }
    
  }

  setMessage(event: any) {
    this.message.text = event.target.value;
    this.message.timestamp = new Date().toISOString();
  }

  formateDate (date : string) : string{
    return this.utilsvc.dateAndHoursISOStringToLegible(date)
  }

  sendMessage() {
    if (this.message.text.trim() !== '') {
      this.messageTextarea.nativeElement.value = '';
      this.storeMessage();
      this.message.id = this.messID;
      this.socketSvc.sendMessage( this.message, this.chatRef.roomkey);
      const newmess = {...this.message};
      this.chatMessages.update(mess =>[...mess, newmess]);
      this.scrollToBottom();
    }
  }

  async storeMessage() {
    try {
      const res = await this.restSvc.storeMessage(this.message , this.chatRef.roomkey);
      const updatedChat : IChat = res.others as IChat;
      updatedChat.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.messID = updatedChat.messages[0].id!;
    } catch (error) {
      console.log(error)
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }, 1500);
  }

  private isChatMessage(message: ChatMessage | GroupMessage): message is ChatMessage {
    return (message as ChatMessage).isRead !== undefined;
  }

  ngAfterContentInit(): void {
    this.scrollToBottom();
  }

  initializeChat (){
    this.user = this.signalStorageSvc.RetrieveUserData()()!;
    this.message.sender.linxname = this.user.account.linxname;
    this.message.sender.userid =  this.user.userid;
    this.message.to =  this.chatRef.participants.userid_b;
    this.chatMessages.set(this.chatRef.messages);
  }

  ngOnInit(): void {
    this.flowbitesvc.loadFlowbite()
    initDropdowns();
    this.initializeChat();
    this.markMessagesAsRead();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
