import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { SnotifyService } from 'ng-snotify';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-entrance',
  templateUrl: './entrance.component.html',
  styleUrls: ['./entrance.component.scss']
})
export class EntranceComponent implements OnInit {

  constructor(private dl: DataloaderService, private route: ActivatedRoute, private Auth: AuthService,
    private notify: SnotifyService, private tn: TokenService, private router: Router, private translate: TranslateService,) { 

      // this language will be used as a fallback when a translation isn't found in the current language
      this.translate.setDefaultLang('en');

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      this.translate.use('en');
    }

  public link: string = '';
  public error = null;
  public locales: any;
  public loading_screen: boolean = true;
  public request_update_screen: boolean = false;
  public update_message_screen: boolean = false;
  public disable_request_button: boolean = false;

  ngOnInit() {

    let that = this;

    //  Get app locales
    this.dl.getLocales().subscribe((e)=>{
      console.log('Get app locales');
      console.log(e);

      this.locales = e;

      let sub = that.route.params.subscribe(params => {
        if(params.hasOwnProperty('l')){
          that.link = params['l']; // (+) converts string 'id' to a number
          that.dl.entrance(that.link).subscribe(
            data => that.handleResponse(data),
            //error => this.handleError(error)
            error => that.notify.error(error.error.error, {timeout: 5000})
          );
        }
  
      });
      
    });
    
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
      this.loading_screen = false;
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
