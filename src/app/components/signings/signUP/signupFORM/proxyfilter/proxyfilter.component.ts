import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
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
  public userCurrentAddress : string = '';

  private _locationData! : any;

  onProxyRangeChange(){
    this.userProfileChange.emit(this.userProfile);
  }

  async trackUserCurrentLocation(){
    navigator.geolocation.getCurrentPosition((position)=>{
      this.userCurrentLocation.latitude = position.coords.latitude;
      this.userCurrentLocation.longitude = position.coords.longitude;

      this.getCurrentAddress(this.userCurrentLocation.latitude, this.userCurrentLocation.longitude)
    })

  }

  async getCurrentAddress(lat : number, long : number){
    try {
      const _res : IRestMessage = await this.restnodeSvc.trackUserLocationGoogleGeocode(lat, long)

      if(_res.code === 0){
        this._locationData = _res.others;
        this.userCurrentAddress = _res.others.formatAddr;
        this.userProfile.geolocation = this._locationData.fullLoc;
        this.userProfileChange.emit(this.userProfile);
      }else{
        this.userCurrentAddress = 'no podemos localizarte... 👹'
      }  
    } catch (error) {
      this.userCurrentAddress = 'no podemos localizarte... 👹'
    }
    
  }

  ngOnInit(): void {
    this.trackUserCurrentLocation();  
  }

}
