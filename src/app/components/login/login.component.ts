import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { SnotifyService } from 'ng-snotify';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private dl: DataloaderService, 
    private tn: TokenService,
    private router: Router,
    private Auth: AuthService,
    private notify: SnotifyService,
    private translate: TranslateService,
  ) { 
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use('en');
  }

  public form = {
  	email: null,
  	password: null,
    userlocale: 'en'
  }

  public error = null;
  public language = 'en';
  public locales: any;
  public have_link: boolean = false;
  public login_link: string = '';
  public login_screen: boolean = true;
  public request_update_screen: boolean = false;
  public update_message_screen: boolean = false;
  public disable_request_button: boolean = false;

  ngOnInit() {
    //  Get app locales
    this.dl.getLocales().subscribe((e)=>{
      console.log('Get app locales');
      console.log(e);
      //if(e && typeof e.length !== 'undefined' && e.length > 0){
        this.locales = e;
      //}
    })
  }

  onSubmit() {
    
    this.dl.login(this.form).subscribe(
      data => this.handleResponse(data),
      //error => this.handleError(error)
      error => this.notify.error(error.error.error, {timeout: 5000})
    );

  }

  loginByLink() {
    let lnk: any = this.login_link.split('/');
    let link: any = '';
    if(lnk.length > 0) link = lnk[lnk.length - 1];
    this.dl.entrance(link).subscribe(
      data => this.handleResponse(data),
      //error => this.handleError(error)
      error => this.notify.error(error.error.error, {timeout: 5000})
    );
  }

  handleResponse(data) {

    //  Check if we received expired link message
    if(typeof data.expired !== 'undefined' && data.expired){
      console.log('Link expired');
      console.log(data);
      //  Get current user locale
      let lang = data.options;
      //  Default locale
      let current_locale = 'en';
      for(let i in this.locales){
        let lc = this.locales[i];
        if(lc.lang === lang) current_locale = lc.locale;
      }
      //  Set new locale
      this.translate.use(current_locale);
      //  Hide loading and show message
      this.login_screen = false;
      this.request_update_screen = true;
      return;
    }

    this.tn.handle(data.access_token);
    this.Auth.changeAuthStatus(true);
    this.notify.success('You are logged in!', {timeout: 2000});
    this.router.navigateByUrl('/home');
  }

  handleError(error) {
    this.error = error.error.error;
  }

  setNewLanguage(l){
    this.translate.use(l);
    this.form.userlocale = l;
  }

  sendRequestToUpdate() {
    let that = this;
    this.disable_request_button = true;

    //  Imitation of sent request
    setTimeout(()=>{
      that.request_update_screen = false;
      that.update_message_screen = true;
    }, 400);

  }

}
