import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { IRestMessage } from '../models/IRestMessage';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private _httpClient : HttpClient) { }

  public searchTrack(searchParams : {q : String , type : String}): Promise<IRestMessage> {
    
    const res = this._httpClient.get<IRestMessage>(`http://localhost:3000/api/SearchMedia/items?q=${searchParams.q}&type=${searchParams.type}`) as Observable<IRestMessage>;
    return lastValueFrom(res);
  }

  
}
