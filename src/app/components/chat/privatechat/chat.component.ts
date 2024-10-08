import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
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
  @Input() chatRef!: IChat ;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  private flowbitesvc = inject(FlowbiteService);
  private signalStorageSvc = inject(SignalStorageService);
  private restSvc = inject(RestnodeService);
  private socketSvc = inject(WebsocketService);
  private utilsvc = inject(UtilsService);

  public chat: IChat = {name:'', participants: { userid_a: '', userid_b: '' }, messages: [], roomkey: ''};
  public groupChat :  IGroupChat = {name:'', groupParticipants: [], messages: [], roomkey: '', chainId : ''};
  public message: ChatMessage = { isRead : false, text: '', timestamp: '', sender: { userid: '', linxname: '' }, to :''};
  public user!: IUser;

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
          this.socketSvc.markMessageAsRead(data, this.user.userid, data.sender.userid);
        }else{
          data.isRead = false;
        }
        this.chatRef.messages.push(data);
      }
      this.ref.detectChanges();
      this.scrollToBottom();
    });

    effect(() => {
      if(this.isOpen()){
        this.scrollToBottom();
      }
    })
  }
  
  closeModal() {
    this.isOpen.set(false);
  }

  async markMessagesAsRead(){
    let readMessages : IMessage[] = [];
    this.chatRef.messages.forEach(mess => {
      if(!mess.isRead && mess.sender.userid !== this.user.userid){
        readMessages.push(mess)
      }
    })
    console.log('messages to update read : ', readMessages)
    try {
      const res = await this.restSvc.markMessagesAsRead(this.user.userid , this.chatRef.roomkey);
      if (res.code === 0) {
        console.log('Messages marked at chatmodal : ', res.message);
        this.chatRef.messages.forEach(m =>  {
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
      this.chatRef.messages.push(newmess);
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
