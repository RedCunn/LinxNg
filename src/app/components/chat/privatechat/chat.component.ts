import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { initDropdowns} from 'flowbite';
import { IChat } from '../../../models/chat/IChat';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { WebsocketService } from '../../../services/websocket.service';
import { UtilsService } from '../../../services/utils.service';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { IMessage } from '../../../models/chat/IMessage';
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

  public chat: IChat = {conversationname:'', participants: { userid_a: '', userid_b: '' }, messages: [], roomkey: ''};
  public groupChat :  IGroupChat = {conversationname:'', groupParticipants: [], messages: [], roomkey: ''};
  public message: IMessage = { isRead : false, text: '', timestamp: '', sender: { userid: '', linxname: '' }};
  public user!: IUser;
  public receiveruserid: string = '';

  private destroy$ = new Subject<void>();
  public messages: IMessage[] = [];
  private messID : string  = '';

  constructor(private ref: ChangeDetectorRef) {
    this.socketSvc.getMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      console.log('constr chat getMessages : ', data)
      if(this.isOpen() && data.sender.userid !== this.user.userid){
        data.isRead = true;
        this.socketSvc.markMessageAsRead(data, this.user.userid, data.sender.userid);
      }else{
        data.isRead = false;
      }
      this.messages.push(data);
      this.ref.detectChanges();
      this.scrollToBottom();
    });
  }
  
  closeModal() {
    this.isOpen.set(false);
  }

  async markMessagesAsRead(){
    let readMessages : IMessage[] = [];
    this.messages.forEach(mess => {
      if(!mess.isRead && mess.sender.userid !== this.user.userid){
        readMessages.push(mess)
      }
    })
    console.log('messages to update read : ', readMessages)
    try {
      const res = await this.restSvc.markMessagesAsRead(readMessages , this.user.userid!);
      if (res.code === 0) {
        console.log('Messages marked at chatmodal : ', res.message);
        this.messages.forEach(m =>  {
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

  async sendMessage() {
    if (this.message.text.trim() !== '') {
      console.log('ROOMKEY DEL CHAT : ', this.chatRef.roomkey)
      console.log('SENDING MESSAGE ------> ', this.message)
      this.messageTextarea.nativeElement.value = '';
      await this.storeMessage(this.message);
      this.message._id = this.messID;
      this.socketSvc.sendMessage( this.message, this.chatRef.roomkey);
    }
  }

  async storeMessage(message: IMessage) {
    try {
      console.log('STORING MESSAGE ----> ', { chat: { participants: { userid_a: this.user.userid, userid_b: this.receiveruserid }, message: message }, roomkey: this.chatRef.roomkey })
      const res = await this.restSvc.storeMessage({ participants: { userid_a: this.user.userid, userid_b: this.receiveruserid }, message: message }, this.chatRef.roomkey);
      console.log('Storing message response : ',res.others)

      const updatedChat : IChat = res.others as IChat;
      updatedChat.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.messID = updatedChat.messages[0]._id!;
    } catch (error) {
      console.log(error)
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }, 1500);
  }

  initializeChat() {
    this.user = this.signalStorageSvc.RetrieveUserData()()!;
    this.receiveruserid = this.chatRef.participants.userid_a === this.user.userid ? this.chatRef.participants.userid_b : this.chatRef.participants.userid_a
    this.message.sender = { userid: this.user.userid, linxname: this.user.account.linxname }
    if (this.chatRef.messages !== null ) {
      this.messages = this.chatRef.messages;
      this.scrollToBottom();
    }
  }

  ngAfterContentInit(): void {
    this.scrollToBottom();
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
