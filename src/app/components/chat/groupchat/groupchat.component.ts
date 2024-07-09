import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { WebsocketService } from '../../../services/websocket.service';
import { UtilsService } from '../../../services/utils.service';
import { IMessage } from '../../../models/chat/IMessage';
import { Subject, takeUntil } from 'rxjs';
import { IUser } from '../../../models/account/IUser';

@Component({
  selector: 'app-groupchat',
  standalone: true,
  imports: [],
  templateUrl: './groupchat.component.html',
  styleUrl: './groupchat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupchatComponent implements OnInit, OnDestroy , AfterContentInit{

  @Input() isOpen = signal(false);
  @Input() groupChatRef! : IGroupChat;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  private signalStorageSvc = inject(SignalStorageService);
  private restSvc = inject(RestnodeService);
  private socketSvc = inject(WebsocketService);
  private utilsvc = inject(UtilsService);

  public groupChat :  IGroupChat = {conversationname:'', groupParticipants: [], messages: [], roomkey: ''};
  public message: IMessage = { isRead : false, text: '', timestamp: '', sender: { userid: '', linxname: '' }};
  public user!: IUser;

  private destroy$ = new Subject<void>();
  public messages: IMessage[] = [];
  private messID : string  = '';

  constructor(private ref: ChangeDetectorRef) {
    this.socketSvc.getMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      console.log('constr chat getMessages : ', data)
      this.messages.push(data);
      this.ref.detectChanges();
      this.scrollToBottom();
    });
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
      console.log('ROOMKEY DEL CHAT : ', this.groupChatRef.roomkey)
      console.log('SENDING MESSAGE ------> ', this.message)
      this.message.sender.linxname = this.user.account.linxname;
      this.message.sender.userid = this.user.userid;
      this.messageTextarea.nativeElement.value = '';
      await this.storeMessage(this.message)
      this.socketSvc.sendMessage( this.message, this.groupChatRef.roomkey);
    }
  }

  async storeMessage(message: IMessage) {
    try {
      console.log('STORING MESSAGE ----> ', { chat: { groupParticipants: this.groupChatRef.groupParticipants, message: message }, roomkey: this.groupChatRef.roomkey })
      const res = await this.restSvc.StoreMessageGroupChat({ groupParticipants: this.groupChatRef.groupParticipants, message: message }, this.groupChatRef.roomkey );
      console.log('Storing message response : ',res.others)
      const updatedChat : IGroupChat = res.others as IGroupChat;
      updatedChat.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.log(error)
    }
  }
  
  closeModal() {
    this.isOpen.set(false);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }, 1500);
  }

  initializeChat() {
    this.user = this.signalStorageSvc.RetrieveUserData()()!;
    this.message.sender = { userid: this.user.userid, linxname: this.user.account.linxname }
    if (this.groupChatRef.messages !== null ) {
      this.messages = this.groupChatRef.messages;
      this.scrollToBottom();
    }
  }

  ngOnInit(){
    this.initializeChat();
  }

  ngAfterContentInit(): void {
    this.scrollToBottom();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
