import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { UtilsService } from '../../../services/utils.service';
import { SignalStorageService } from '../../../services/signal-storage.service';
import { RestnodeService } from '../../../services/restnode.service';
import { IUser } from '../../../models/account/IUser';

@Component({
  selector: 'app-candidatedata',
  standalone: true,
  imports: [],
  templateUrl: './candidatedata.component.html',
  styleUrl: './candidatedata.component.scss'
})
export class CandidatedataComponent {

  private signalStoreSvc: SignalStorageService = inject(SignalStorageService);
  private restSvc: RestnodeService = inject(RestnodeService);
  private utilsvc: UtilsService = inject(UtilsService);

  public candidateData!: IUser;
  public cadidateAttributes: Map<string, string> = new Map<string, string>();
  public candidateResidency : WritableSignal<string | null> = signal(null);

  constructor(){
    this.candidateData = this.signalStoreSvc.RetrieveCandidateData()()!;
    this.cadidateAttributes = this.utilsvc.mapCandidateProfileDataToLegible(this.candidateData);
    this.getPlaceDetail()
  }

  async getPlaceDetail() {
    try {
      const res = await this.restSvc.getPlaceDetails(this.candidateData.geolocation.city_id);
      if (res.code === 0) {
        const addrComponents = res.others.address_components;
        let residency = addrComponents[1].long_name + ' , ' + addrComponents[2].long_name;
        this.candidateResidency.set(residency);
      } else {
        console.log('RES DE GOOGLE : ', res.error)
      }
    } catch (error) {
      console.log('RES DE GOOGLE : ', error)
    }
  }


}
