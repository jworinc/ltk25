import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { OptionService } from '../../services/option.service';
import { PlaymediaService } from '../../services/playmedia.service';

@Component({
  selector: 'app-msmenu',
  templateUrl: './msmenu.component.html',
  styleUrls: ['./msmenu.component.scss']
})
export class MsmenuComponent implements OnInit {

  private _sidetripmode: boolean;
  public fullscreen_mode: boolean = false;

  @Output() public sidetripmode = new EventEmitter<boolean>();
  @Output() public closemenu = new EventEmitter<boolean>();
  @Output() public showsettings = new EventEmitter<boolean>();
  @Output() public showfeedback = new EventEmitter<boolean>();
  @Input() public lu: string;
  @Input() public show_tool_pages_list: boolean;
  @Input() public show_menu_open_button: boolean;

  constructor(
  	private Auth: AuthService,
  	private router: Router,
  	private Token: TokenService,
    translate: TranslateService,
    private Option: OptionService,
    private playmedia: PlaymediaService,
    private lcn: Location
  ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(Option.getFallbackLocale());

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(Option.getLocale());
  }

  ngOnInit() {
    let that = this;
    if ((document as any).addEventListener)
    {
        (document as any).addEventListener('webkitfullscreenchange', exitHandler, false);
        (document as any).addEventListener('mozfullscreenchange', exitHandler, false);
        (document as any).addEventListener('fullscreenchange', exitHandler, false);
        (document as any).addEventListener('MSFullscreenChange', exitHandler, false);
    }

    function exitHandler()
    {
        if (!(document as any).fullscreenElement &&    // alternative standard method
      !(document as any).mozFullScreenElement && !(document as any).webkitFullscreenElement && !(document as any).msFullscreenElement)
        {
            that.fullscreen_mode = false;
        } else {
            that.fullscreen_mode = true;
        }
    }
  }

  logout(event: MouseEvent){
  	console.log('Logout');
    event.preventDefault();
    this.playmedia.stop();
    let p = this.lcn.path();
    if(p === '/home'){
      this.Auth.changeAuthStatus(false);
      this.router.navigateByUrl('/login');
      this.Token.remove();
    } else {
      this.router.navigateByUrl('/home');
    }
  }


  toggleSidetrip() {
    if(this._sidetripmode) this._sidetripmode = false;
    else this._sidetripmode = true;
    this.sidetripmode.emit(this._sidetripmode);
  }

  closeMenu() {
    this.closemenu.emit();
  }

  location(u) {
    this.playmedia.stop();
    this.router.navigateByUrl(u);
  }

  showSettingsModal() {
    this.showsettings.emit();
  }

  showFeedbackModal() {
    this.showfeedback.emit();
  }

  fullscreenMax() {
    this.toggleFullScreen();
  }
  fullscreenMin() {
    this.toggleFullScreen();
  }

  toggleFullScreen() {
    if (!(document as any).fullscreenElement &&    // alternative standard method
      !(document as any).mozFullScreenElement && !(document as any).webkitFullscreenElement && !(document as any).msFullscreenElement ) {  // current working methods
      if ((document as any).documentElement.requestFullscreen) {
        (document as any).documentElement.requestFullscreen();
        this.fullscreen_mode = true;
      } else if ((document as any).documentElement.msRequestFullscreen) {
        (document as any).documentElement.msRequestFullscreen();
        this.fullscreen_mode = true;
      } else if ((document as any).documentElement.mozRequestFullScreen) {
        (document as any).documentElement.mozRequestFullScreen();
        this.fullscreen_mode = true;
      } else if ((document as any).documentElement.webkitRequestFullscreen) {
        (document as any).documentElement.webkitRequestFullscreen();
        this.fullscreen_mode = true;
      }
    } else {
      if ((document as any).exitFullscreen) {
        (document as any).exitFullscreen();
        this.fullscreen_mode = false;
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
        this.fullscreen_mode = false;
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
        this.fullscreen_mode = false;
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        this.fullscreen_mode = false;
      }
    }
  }

}
