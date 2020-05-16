import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {

  constructor(private http: HttpClient, private Token: TokenService) { 
    this.base_url = Token.getApiUrl();
  }

  private base_url = 'https://api.ltk.cards/api';

  log(data) {
    return this.http.post(`${this.base_url}/error/log`, data, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }
  
}
