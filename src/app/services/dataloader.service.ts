import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataloaderService {

  private base_url = 'https://api.ltk.cards/api';
  public lu = 10;
  public card_descriptor = 'none';

  constructor(
    private http: HttpClient, 
    private Token: TokenService,
  ) { 
    this.base_url = Token.getApiUrl();
  }

  //	Use login and pass to login user in app
  login(data) {
    return this.http.post(`${this.base_url}/login`, data)
  }

  entrance(link) {
    return this.http.get(`${this.base_url}/entrance/${link}`)
  }

  //  Using to get all existed locales and languages
  getLocales() {
    return this.http.get(`${this.base_url}/locales`)
  }

  setLastUncompleteLesson(data) {
      console.log('--------------DataLoader Service------------------');
      console.log('Last uncomplete student lesson: ' + (+data.last_uncomplete));
      this.lu = +data.last_uncomplete;
  }

  //  Loads base student info for dashboard
  getStudentInfo() {
    let ss = this.http.get(`${this.base_url}/u/studentinfo`, {
      headers: this.Token.getAuthHeader()
    });
    let that = this;
    ss.subscribe(
      data => this.setLastUncompleteLesson(data),
      error => {
        console.log('Student Info load error:');
        console.log(error);
      });
    return ss;
  }

  //	Loads lessons list for current student
  getLessons() {
  	return this.http.get(`${this.base_url}/u/lessons`, {
      headers: this.Token.getAuthHeader()
    })
  }

  //  Load cards according to lesson number
  getCards(l) {
    return this.http.get(`${this.base_url}/u/cards/${l}`, {
      headers: this.Token.getAuthHeader()
    })
  }

  //  Get options
  getOptions(){
    
    return this.http.get(`${this.base_url}/options/get`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());

  }

  //  Save Options
  saveOptions(data) {
    
    return this.http.post(`${this.base_url}/options/save`, data, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());

  }

  //  Save Feedback
  saveFeedback(data) {
    
    return this.http.post(`${this.base_url}/feedback`, data, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());

  }

  activities() {
    return this.http.get(`${this.base_url}/activities`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  showme(l) {
    return this.http.get(`${this.base_url}/u/reports/showme/${l}`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getStudentLessons() {
    return this.http.get(`${this.base_url}/u/reports/get_student_lessons`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getProgress() {
    return this.http.get(`${this.base_url}/u/reports/progress`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getDetail() {
    return this.http.get(`${this.base_url}/u/reports/detail`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getSummary() {
    return this.http.get(`${this.base_url}/u/reports/summary`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getPlacement() {
    return this.http.get(`${this.base_url}/reports/placement`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }


  logMissingAudio(m) {
    return this.http.post(`${this.base_url}/media/log/missing/audio`, {'url': m}, {
      headers: this.Token.getAuthHeader()
    }).pipe(share());
  }

  
  getSightWords() {
    return this.http.get(`${this.base_url}/sightwords`, {
        headers: this.Token.getAuthHeader()
      }).pipe(share());
  }

  getNotebookWords(){
    // return this.http.post(`${this.base_url}/card`, c, {
    //   headers: this.Token.getAuthHeader()
    // }).pipe(share());
  }

  getGrammarTopics(){
    return this.http.get(`${this.base_url}/grammar/topics`, {
      headers: this.Token.getAuthHeader()
    }).pipe(share());
  }

  getGrammarContent(id){
    return this.http.get(`${this.base_url}/grammar/rule/`+id, {
      headers: this.Token.getAuthHeader()
    }).pipe(share());
  }
  
  getTest() {
    return this.http.get(`${this.base_url}/testing/${this.lu}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
  }


}
