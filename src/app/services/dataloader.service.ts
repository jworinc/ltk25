import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { share } from 'rxjs/operators';
import { empty } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataloaderService {

  private base_url = 'https://api.ltk.cards/api';
  public lu = 10;
  public card_descriptor = 'none';
  public current_locale = 'en';

  constructor(
    private http: HttpClient, 
    private Token: TokenService,
  ) { 
    this.base_url = Token.getApiUrl();
  }

  getLocale(){ return this.current_locale; }
  setLocale(locale) { this.current_locale = locale; }

  //	Use login and pass to login user in app
  login(data) {
    return this.http.post(`${this.base_url}/login`, data)
  }

  //	Use login and pass to login user in app
  relatedLogin(data) {
    return this.http.post(`${this.base_url}/rel/login`, data, {
      headers: this.Token.getAuthHeader()
    });
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

  //  Get SKU params
  getSKUParams() {

    return this.http.get(`${this.base_url}/settings/sku/params`, {
      headers: this.Token.getAuthHeader()
    }).toPromise();

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
    if(!this.Token.loggedIn()) return empty();
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

  getTranslation(word, locale = null) {
    if(typeof word == 'undefined' || word === "") return empty().toPromise();
    if(!locale && this.Token.loggedIn()) {
      return this.http.get(`${this.base_url}/service/word/translation/${word}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    } else {
      let loc = this.getLocale();
      if(locale) loc = locale;
      return this.http.get(`${this.base_url}/service/word/translation/${word}/${loc}`, {}).toPromise();
    }
  }

  getLastFeedbacks(descriptor) {
    if(descriptor) {
      let d = descriptor.replace('#', 'N');
      return this.http.get(`${this.base_url}/feedback/${d}`, {
          headers: this.Token.getAuthHeader()
        }).toPromise();
    } else return empty().toPromise();
  }

  sendCourseExpiredNotificationEmail() {
    return this.http.get(`${this.base_url}/notification/course/expired`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
  }

<<<<<<< HEAD
=======
  getTest() {
    return this.http.get(`${this.base_url}/testing/${this.lu}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
  }

  getPlacement() {
    if(this.Token.getCode() !== ""){
      return this.http.get(`${this.base_url}/placement/${this.Token.getCode()}/${this.Token.getEmail()}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    } else {
      return this.http.get(`${this.base_url}/placement/${this.Token.getEmail()}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    }
  }

  getProfPlacement(prof) {
    return this.http.get(`${this.base_url}/placement/prof/${prof}/${this.Token.getEmail()}`, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }

  getTypedTest(type) {
    if(this.Token.getCode() !== ""){
      return this.http.get(`${this.base_url}/testing/typed/${this.Token.getCode()}/${type}/${this.Token.getEmail()}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    } else {
      return this.http.get(`${this.base_url}/testing/typed/${type}/${this.Token.getEmail()}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    }
    
  }

  getAssesmentLevels() {
    if(this.Token.loggedIn() && this.Token.getCode() !== '') {
      return this.http.get(`${this.base_url}/assesment/levels/${this.Token.getCode()}`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    } 
    else if(this.Token.loggedIn() && this.Token.getCode() === ''){
      return this.http.get(`${this.base_url}/assesment/levels`, {
        headers: this.Token.getAuthHeader()
      }).toPromise();
    } else {
      if(this.Token.getCode() !== '') return this.http.get(`${this.base_url}/assesment/levels/${this.Token.getCode()}`).toPromise();
      else return this.http.get(`${this.base_url}/assesment/levels`).toPromise();
    }
    
  }

  startTest(data) {
    return this.http.post(`${this.base_url}/placement/start`, data).toPromise();
  }

  sendRegisterRequest(email, name='none') {
    return this.http.get(`${this.base_url}/placement/register/${this.logid}/${email}/${name}`).toPromise();
  }

  setLogId(logid) {
    this.logid = logid;
  }


>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
  sendLinkExpiredNotificationEmail(link) {
    return this.http.get(`${this.base_url}/service/expired/${link}`).toPromise();
  }

  setStudentName(name) {
    return this.http.post(`${this.base_url}/student/set/name`, {'name': name}, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }

  sendStudentFindTutorRequest(email) {
    return this.http.post(`${this.base_url}/student/send/findtutor`, {'email': email}, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }

  getHelpConfiguration() {
    return this.http.get(`${this.base_url}/config/help/menu`, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }

  setStartingLesson(ln) {
    return this.http.get(`${this.base_url}/student/set/starting/${ln}`, {
      headers: this.Token.getAuthHeader()
    }).toPromise();
  }

}
