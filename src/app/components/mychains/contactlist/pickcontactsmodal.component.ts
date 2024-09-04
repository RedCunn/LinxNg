import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { IAccount } from '../../../models/account/IAccount';
import { IChain } from '../../../models/chain/IChain';
import { IUser } from '../../../models/account/IUser';

@Component({
  selector: 'app-pickcontactsmodal',
  standalone: true,
  imports: [],
  templateUrl: './pickcontactsmodal.component.html',
  styleUrl: './pickcontactsmodal.component.scss'
})
export class PickcontactsmodalComponent implements OnInit{

  @Input() isOpen = signal(false);

  private signalsvc = inject(SignalStorageService)
  private restsvc = inject(RestnodeService)

  private user! : IUser;
  public contacts : WritableSignal<IAccount[]> = signal([]);
  public pickedContacts : WritableSignal<IAccount[]> = signal([]);
  public showNamePicking = signal(false);
  public abledCreateChain = signal(false);
  public successfulRequest = signal(false);
  public unsuccessfulRequest = signal(false);
  public chainNameTaken = signal(false);
  public reqSent = signal(false);
  private chainName : string = '';
  private now : Date = new Date();
  private newChain : IChain = {chainAdminsId : [], active : false, chainId : '', chainName : '', createdAt : this.now.toISOString(), accounts : []}

  pickName(){
    this.showNamePicking.set(true);
  }

  async createChain(){
    try {
      const nameAvailable = await this.checkChainNameNotTaken();

      if(nameAvailable){
        this.chainNameTaken.set(false);
        this.reqSent.set(true);
        this.newChain.chainAdminsId.push(this.user.userid);
        this.newChain.chainName = this.chainName;
  
        this.pickedContacts().forEach(element => {
          this.newChain.accounts.push(element);
          this.newChain.accounts.push(this.user.account);
        });
  
        const res = await this.restsvc.createChain(this.user.userid, this.newChain)
  
        if(res.code === 0){
          this.successfulRequest.set(true);
          this.unsuccessfulRequest.set(false);
        }else{
          console.log('ERROR REQUESTING CREATE CHAIN ON PICKCONTACTS COMPO : ', res.error)
          this.successfulRequest.set(false);
          this.unsuccessfulRequest.set(true);
        }
      }else{
        this.chainNameTaken.set(true);
      }
      
    } catch (error) {
      console.log('ERROR REQUESTING CREATE CHAIN ON PICKCONTACTS COMPO : ', error)
      this.successfulRequest.set(false);
      this.unsuccessfulRequest.set(true);
    }
  }

  async checkChainNameNotTaken() : Promise<boolean>{
    try {
      const res = await this.restsvc.checkChainNameAvailability(this.user.userid , this.chainName);
      if(res.code === 0){
        return res.userdata;
      }else{
        console.log('ERROR CHECKING CHAIN NAME AVAILABILITY ON PICKCONTACTSMODAL : ', res.error)
      }
    } catch (error) {
      console.log('ERROR CHECKING CHAIN NAME AVAILABILITY ON PICKCONTACTSMODAL : ', error)
    }

    return false;
  }

  searchContact(event : any){
    const name = event.target.value.toLowerCase().trim();

    if(name.trim() !== ''){
      this.contacts.update(current => {
        return current.filter(contact => 
          contact.linxname.toLowerCase().includes(name)
        );
      })
    }else{
      this.loadContacts()
    }
  }

  isSelected(userid : string) : boolean{
    return this.pickedContacts().find(account => account.userid === userid) !== undefined
  }

  setChainName(event : any){
    const chainname = event.target.value.trim(); 
    if(chainname !== ''){
      this.abledCreateChain.set(true);
      this.chainName = chainname;
    }else{
      this.abledCreateChain.set(false);
      this.chainName = '';
    }
  }

  addContact(event : any){
    const isChecked = event.target.checked; 
    const userId = event.target.value; 

    if(isChecked){
      const account = this.contacts().find(contact => contact.userid === userId);
      if(account){
        this.pickedContacts.update(current => [...current, account])
      }
    }else{
      const contactIdx = this.pickedContacts().findIndex(contact => contact.userid === userId)
      if(contactIdx !== -1){
        this.pickedContacts.update(current => current.filter(contact => contact.userid !== userId));
      }
    }
    
  }

  loadContacts(){

    this.contacts.set([]);

    const connections = this.signalsvc.RetrieveConnections()();
    const linxs = this.signalsvc.RetrieveMyLinxs()();

    if(connections){
      connections.forEach(conn => {
        this.contacts.update( cons => [...cons, conn.account])
      })
    }
    if(linxs){
      linxs.forEach(linx => {
        this.contacts.update( cons => [...cons, linx])
      })
    }

    this.contacts.update(current => {
      return [...current].sort((a, b) => a.linxname.localeCompare(b.linxname));
    })
  }

  ngOnInit(): void {
    this.loadContacts();
    this.user = this.signalsvc.RetrieveUserData()()!;
  }

  closeModal() {
    this.reqSent.set(false);
    this.showNamePicking.set(false);
    this.pickedContacts.set([]);
    this.abledCreateChain.set(false);
    this.isOpen.set(false);
  }

}
