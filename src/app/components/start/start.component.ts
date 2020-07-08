import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DataloaderService } from '../../services/dataloader.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(private translate: TranslateService,
              private router: Router,
              private ar: ActivatedRoute,
              private dl: DataloaderService,
              private tn: TokenService) 
  { 
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(window.navigator.language.substr(0, 2));
  }

  public form = {
  	email: null,
  	password: null,
    userlocale: 'en',
    name: '',
    code: '',
    type: ''
  }

  public testing_code = "";
 
  public email_alert = false;

  ngOnInit() {
    let that = this;
    if(that.ar.snapshot.routeConfig.path.split("/")[0] === "start") {
      let sub = that.ar.params.subscribe(params => {
        if(params.hasOwnProperty('e') && params.hasOwnProperty('n')){
          let email = params['e'];
          let name = params['n'];
          that.form.email = email;
          that.form.name = name;
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('e')){
          let email = params['e'];
          that.form.email = email;
          that.handleResponse(that.form);
          //that.startATest();
        }
  
      });
    } 
    else if(that.ar.snapshot.routeConfig.path.split("/")[0] === "pcm") {
      let sub = that.ar.params.subscribe(params => {
        if(params.hasOwnProperty('code') && params.hasOwnProperty('e') && params.hasOwnProperty('n')){

          let email = params['e'];
          let name = params['n'];
          that.form.email = email;
          that.form.name = name;
          that.form.code = params['code'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('code') && params.hasOwnProperty('e')){
          let email = params['e'];
          that.form.email = email;
          that.form.code = params['code'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('code')){
          that.form.code = params['code'];
          that.form.email = this.tn.getEmail();
          if(this.tn.loggedIn()) that.handleResponse(that.form);
        }
  
      });
    }
    else if(that.ar.snapshot.routeConfig.path.split("/")[0] === "test") {
      let sub = that.ar.params.subscribe(params => {
        if(params.hasOwnProperty('type') && params.hasOwnProperty('e') && params.hasOwnProperty('n')){

          let email = params['e'];
          let name = params['n'];
          that.form.email = email;
          that.form.name = name;
          that.form.type = params['type'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('type') && params.hasOwnProperty('e')){
          let email = params['e'];
          that.form.email = email;
          that.form.type = params['type'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('type')){
          that.form.type = params['type'];
          if(this.tn.loggedIn()) {
            that.form.email = this.tn.getEmail();
            that.handleResponse(that.form);
          }
        }
  
      });
    }
    else if(that.ar.snapshot.routeConfig.path.split("/")[0] === "test-code") {
      let sub = that.ar.params.subscribe(params => {
        if(params.hasOwnProperty('code') && params.hasOwnProperty('type') && params.hasOwnProperty('e') && params.hasOwnProperty('n')){

          let email = params['e'];
          let name = params['n'];
          that.form.email = email;
          that.form.name = name;
          that.form.type = params['type'];
          that.form.code = params['code'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('code') && params.hasOwnProperty('type') && params.hasOwnProperty('e')){
          let email = params['e'];
          that.form.email = email;
          that.form.type = params['type'];
          that.form.code = params['code'];
          that.handleResponse(that.form);
          //that.startATest();
        }
        else if(params.hasOwnProperty('code') && params.hasOwnProperty('type')){
          that.form.type = params['type'];
          that.form.code = params['code'];
          if(this.tn.loggedIn()) {
            that.form.email = this.tn.getEmail();
            that.handleResponse(that.form);
          }
        }
  
      });
    }
    
  }

  goToLoginPage() {
    this.router.navigateByUrl('/login');
  }

  
  onSubmit() {
    if(this.form.email === null || this.form.email === ""){
      this.email_alert = true;
      return;
    }
    this.email_alert = false;
    //this.startATest();
    this.handleResponse(this.form);
  }

  startATest() {
    this.dl.startTest(this.form)
      .catch((e)=>{ 
        console.log(e);
        alert('Error during test start, please try again!');
      })
      .then(
        data => this.handleResponse(data)
      );
  }

  handleResponse(data) {
    if(typeof data !== 'undefined'){
      if(data.code !== "") {
        this.tn.setCode(data.code);
      } 
      if(data.type !== "") {
        this.tn.setType(data.type);
      } 
      if(typeof data.name !== 'undefined') this.tn.setEmail(data.email, data.name);
      else this.tn.setEmail(data.email);
      console.log('Your email remembered!');
      this.router.navigateByUrl('/test');
    }
  }


}
