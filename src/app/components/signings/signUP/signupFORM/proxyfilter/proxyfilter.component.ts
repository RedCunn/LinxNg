import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { RestnodeService } from '../../../../../services/restnode.service';
import { IRestMessage } from '../../../../../models/IRestMessage';
import { IUser } from '../../../../../models/account/IUser';
import { USER_TOKEN } from '../tokens/constants';


@Component({
  selector: 'app-proxyfilter',
  standalone: true,
  imports: [],
  templateUrl: './proxyfilter.component.html',
  styleUrl: './proxyfilter.component.scss'
})
export class ProxyfilterComponent implements OnInit{

  private restnodeSvc : RestnodeService = inject(RestnodeService);
  userProfile = inject(USER_TOKEN);
  @Output() userProfileChange = new EventEmitter<IUser>();

  public userCurrentLocation = {latitude : 0, longitude : 0}
  public defaultLocation = {
    latitude: 40.416775,
    longitude: -3.703790
  };
  public browserBlocked = signal(false);
  public userCurrentAddress : string = '';

  private _locationData! : any;

  public disableSelection = signal(false);

  onProxyRangeChange(){
    this.userProfileChange.emit(this.userProfile);
  }

  async trackUserCurrentLocation(){

      navigator.geolocation.getCurrentPosition((position)=>{
        this.userCurrentLocation.latitude = position.coords.latitude;
        this.userCurrentLocation.longitude = position.coords.longitude;
  
        this.getCurrentAddress(this.userCurrentLocation.latitude, this.userCurrentLocation.longitude)
      },
      (error) =>{
        this.browserBlocked.set(true);
        this.disableSelection.set(true);
        console.error('Error getting browser location:', error);
        this.getCurrentAddress(this.defaultLocation.latitude, this.defaultLocation.longitude)
      }
    )
  }

  async getCurrentAddress(lat : number, long : number){
    try {

      const _res = await this.restnodeSvc.trackUserLocationGoogleGeocode(lat, long)
        

      if(_res.code === 0){
        this._locationData = _res.others;
        this.userCurrentAddress = _res.others.formatAddr;
        this.userProfile.geolocation = this._locationData.fullLoc;
        this.userProfileChange.emit(this.userProfile);
      }else{
        this.userCurrentAddress = 'no podemos localizarte... 👹'
        this.disableSelection.set(true);
        await this.getDefaultAddress()
      }  
    } catch (error) {
      this.userCurrentAddress = 'no podemos localizarte... 👹'
      this.disableSelection.set(true);
      await this.getDefaultAddress()
    }
    
  }

  async getDefaultAddress(){
    try {
      const _res : IRestMessage = await this.restnodeSvc.trackUserLocationGoogleGeocode(this.defaultLocation.latitude, this.defaultLocation.longitude)
        if(_res.code === 0){
          this._locationData = _res.others;
          this.userCurrentAddress = _res.others.formatAddr;
          this.userProfile.geolocation = this._locationData.fullLoc;
          this.userProfileChange.emit(this.userProfile);
          console.log('DEFAULT LOC : ', this.userCurrentAddress)
        }else{
          this.userCurrentAddress = 'no hemos podido establecer localización por defecto... 👹'
        }
    } catch (error) {
      this.userCurrentAddress = 'no hemos podido establecer localización por defecto... 👹'
    }
  }

  ngOnInit(): void {
    this.trackUserCurrentLocation();  
  }

}
