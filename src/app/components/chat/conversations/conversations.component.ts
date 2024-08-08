import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { GroupchatComponent } from '../groupchat/groupchat.component';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { IChat } from '../../../models/chat/IChat';
import { UtilsService } from '../../../services/utils.service';
import { ChatMessage, GroupMessage, IMessage, Message } from '../../../models/chat/IMessage';
import { WebsocketService } from '../../../services/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { ChatComponent } from '../privatechat/chat.component';
import { IUser } from '../../../models/account/IUser';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [MatIcon, ChatComponent, GroupchatComponent],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss'
})
export class ConversationsComponent implements OnDestroy {

  @Input() isOpen = signal(false);
  @Input() chats!: IChat[];
  @Input() groupchats!: IGroupChat[];
  private signalStorageSvc = inject(SignalStorageService);
  private utilsvc = inject(UtilsService);
  private socketsvc = inject(WebsocketService);

  public isChatOpen = signal(false);
  public isGroupChatOpen = signal(false);
  private _user!: IUser;
  public chatToOpen: IChat = { name: '', participants: { userid_a: '', userid_b: '' }, roomkey: '', messages: [] };
  public groupChatToOpen: IGroupChat = { name: '', groupParticipants: [], roomkey: '', messages: [] , chainId : ''};
  public messageCountMap: Map<string, number> = new Map<string, number>();

  @ViewChild('chatcompoContainer', { read: ViewContainerRef, static: true })
  public chatcompoContainer!: ViewContainerRef;
  @ViewChild('groupChatContainer', { read: ViewContainerRef, static: true })
  public groupChatContainer!: ViewContainerRef;

  private destroy$ = new Subject<void>();

  constructor() {
    this._user = this.signalStorageSvc.RetrieveUserData()()!;

    this.socketsvc.getReadMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      console.log('read message on conversations : ', data)
    });

  }

  loadChatComponent() {
    const viewContainerRef = this.chatcompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<ChatComponent>(ChatComponent);
    comporef.setInput('isOpen', this.isChatOpen);
    comporef.setInput('chatRef', this.chatToOpen);
  }

  loadGroupChatComponent() {
    const viewContainerRef = this.chatcompoContainer;
    viewContainerRef.clear();
    const comporef = viewContainerRef.createComponent<GroupchatComponent>(GroupchatComponent);
    comporef.setInput('isOpen', this.isGroupChatOpen);
    comporef.setInput('groupChatRef', this.groupChatToOpen);
  }

  setChat(chat: IChat) {
    this.chatToOpen = chat;
    let chatuserid = chat.participants.userid_a === this._user.userid ? chat.participants.userid_b : chat.participants.userid_a;
    let roomkey = this.utilsvc.setRoomKey(this._user.userid, chatuserid);
    this.chatToOpen.roomkey = roomkey;
  }

  setGroupChat(groupchat: IGroupChat) {
    this.groupChatToOpen = groupchat;
  }

  countMessagesUnread(messages: ChatMessage[] | GroupMessage[], type: string): number {
    let count = 0;

    switch (type) {
      case 'chat':
        if (messages.every(m => 'isRead' in m)) {
          messages.forEach((m: ChatMessage) => {
            if (!m.isRead && m.to === this._user.userid) {
              count++;
            }
          });
        }
        break;
      case 'group':
        if (messages.every(m => 'readBy' in m)) {
          messages.forEach((m: GroupMessage) => {
            
            m.readBy.forEach(user => {
              if(user.userid === this._user.userid && !user.isRead){
                count++;
              }
            })

          });
        }
        break;
      default:
        break;
    }

    return count;
  }

  openChat(chat: IChat) {
    this.setChat(chat);
    this.loadChatComponent();
    this.isChatOpen.update(v => !v);
  }

  openGroupChat(groupchat: IGroupChat) {
    this.setGroupChat(groupchat);
    this.loadGroupChatComponent();
    this.isGroupChatOpen.update(v => !v);
  }

  closeModal() {
    this.isOpen.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
