import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ConversationsComponent } from '../../chat/conversations/conversations.component';
import { Router } from '@angular/router';
import { initTooltips } from 'flowbite';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { IChat } from '../../../models/chat/IChat';
import { IMessage } from '../../../models/chat/IMessage';
import { IGroupChat } from '../../../models/chat/IGroupChat';
import { IUser } from '../../../models/account/IUser';
import { InteractionsComponent } from '../../interactions/interactions.component';
import { FlowbiteService } from '../../../services/flowbite.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIcon, ConversationsComponent, InteractionsComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit, OnInit{

  private signalStorageSvc  = inject(SignalStorageService);
  private restSvc = inject(RestnodeService);
  private flowbitesvc = inject(FlowbiteService);

  public isChatsOpen = signal(false);
  public isInteractionsOpen = signal(false);
  private _user! : IUser;
  public chats! : IChat[];
  public groupchats! : IGroupChat[];
  public compressedChats : IChat[] = [];
  private chatsMap : Map<string, IChat[]> = new Map<string, IChat[]>();

  constructor(private router : Router){
    this._user = this.signalStorageSvc.RetrieveUserData()()!;
  }

  toggleChatsModal() {
    this.isChatsOpen.update(v => !v)  
    this.isInteractionsOpen.set(false);
  }
  toggleInteractionsModal() {
    this.isInteractionsOpen.update(v => !v)
    this.isChatsOpen.set(false);
  }

  goLinxme(){
    this.router.navigateByUrl('/Linx/linxme');    
  }

  chatCompression(){

    this.chats.forEach(chat => {
      const participants = [chat.participants.userid_a , chat.participants.userid_b]
      participants.sort();
      const key = participants.join('-')
      if (!this.chatsMap.has(key)) {
        this.chatsMap.set(key, []);
      }
      this.chatsMap.get(key)!.push(chat);
    })

    for (const [key, chatList] of this.chatsMap.entries()) {
      if (chatList.length > 1) {
        const unifiedChat: IChat = {
          conversationname: chatList[0].conversationname,
          messages: chatList.reduce((accumulator: IMessage[], currentChat: IChat) => accumulator.concat(currentChat.messages), []),
          participants: chatList[0].participants,
          roomkey: key
        };
        unifiedChat.messages.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        this.compressedChats.push(unifiedChat);
      } else {
        const singlechat : IChat = chatList[0];
        this.compressedChats.push(singlechat);
      }
    }

  }

  async ngOnInit() : Promise<void>{
    this.flowbitesvc.loadFlowbite()
    
    try {
      const res = await this.restSvc.getMyChats( this._user?.userid!, null);
      if(res.code === 0){
        this.chats = res.others as IChat[]; 
        this.groupchats = res.userdata as IGroupChat[];
        this.chatCompression();
        console.log('CHATS comprimidos EN FOOTER ....', this.compressedChats)
        console.log('CHATS DE GRUPO : ', this.groupchats)
      }else{
        console.log('ERROR ON RETRIEVING CHATS ON FOOTER ; ', res.error)
      }
     } catch (error) {
      console.log('ERROR ON RETRIEVING CHATS ON FOOTER ; ', error)
     } 
  
  }
  ngAfterViewInit(): void {
    initTooltips();
  }


}
