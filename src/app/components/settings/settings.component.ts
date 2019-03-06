import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { RecorderService } from '../../services/recorder.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { DataloaderService } from '../../services/dataloader.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private recorder: RecorderService, 
  				private playmedia: PlaymediaService, 
  				private el: ElementRef, 
  				private dl: DataloaderService,
  				private cs: ColorschemeService,
  				private op: OptionService
  			) { }

  public options: any;
  public globalvolume: any;
  public recgain: any;
  public _show: boolean = false;
  public settings_shown: boolean = false;
  public save_settings_started: boolean = false;
  public locales: any = [];
  
  @Output() closesettings = new EventEmitter<boolean>();
  @Input('show')
  set show(show: boolean) {
     this._show = show;
     this.refreshSettings();
  }

  ngOnInit() {

  	this.options = {
  		screencolor: 0,
  		language: 'english',
  		expertlevel: 0,
  		replevel: 0,
  		quickpace: 0
  	};

    //  Set canvas element context for volume test indicator
    this.recorder.vtest_canvas = $('#test-volume-rec-settings').get(0);

    let that = this;
	$('#app-settings-modal').on('hide.bs.modal', function (e) {

        //  Stop volume test
        that.recorder.disableVolumeTest();

		that.close();

	});

	this.locales = this.op.getLocales();

  }


	micDown(){ this.recgain-=this.recgain<=0?0:1; };
	micUp(){ this.recgain+=this.recgain>=100?0:1; };
	volDown(){ this.globalvolume-=this.globalvolume<=0?0:0.05; };
	volUp(){ this.globalvolume+=this.globalvolume>=1?0:0.05; };

	close(){
		this._show = false;
		this.settings_shown = false;
		//  Stop volume test
        this.recorder.disableVolumeTest();
		this.closesettings.emit();
	}

	save() {

        //  Update volume and microphone settings
        this.options.volume = '' + this.globalvolume;
        this.options.mic = '' + this.recgain;

		console.log(this.options);

        let data = this.options;
        let that = this;
        this.save_settings_started = true;
        this.dl.saveOptions(data).subscribe(
		        data => { that.save_settings_started = false; that.close(); },
		        error => {
		          console.log(error);
		          that.save_settings_started = false;
		          //this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
		        }
		    );

	}

	//	Watch if current card changed, refresh content
	refreshSettings() {
		if(typeof this._show !== 'undefined' && this._show === true && !this.settings_shown){
			this.settings_shown = true;
			
            //  Start volume test
            if(!this.recorder.recorder_init_ready) this.recorder.init();
            this.recorder.enableVolumeTest();

			//	Load current user options
			this.dl.getOptions().subscribe(
		        data => this.getOptionsCallback(data),
		        error => {
		          console.log(error);
		          //this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
		        }
			);
			
			this.locales = this.op.getLocales();

		}
	}


	getOptionsCallback(data) {
		this.options = data;
        this.globalvolume = parseFloat(data.volume);
        this.recgain = parseInt(data.mic);
        this.options.quickpace = this.options.quickpace === '1'?true:false;
		this.op.setLanguage(data.language);
	}
	

	onChangeRecgain(val) {
		this.recgain = this.options.recgain = val;
		this.recorder.setGain(this.recgain);
	}

	onChangeGlobalvolume(val){
		this.globalvolume = val;
		this.playmedia.setVolume(this.globalvolume);
	}

	setExpertlevel(val) {
		if(typeof this.options.expertlevel !== 'undefined'){
			this.options.expertlevel = val;
            this.playmedia.setRate(0.8 + (parseInt(this.options.expertlevel)*0.04));
		}
	}

	setReplevel(val) {
		if(typeof this.options.replevel !== 'undefined'){
			this.options.replevel = val;
		}
	}

	//  Watcher for screencolor
	setScreencolor(val) {
		if(typeof this.options.screencolor !== 'undefined'){
			this.options.screencolor = val;
            //colorscheme.setScheme(parseInt(this.options.screencolor));
            this.cs.setScheme(val);
		}
	}

	onLangChange(lang){
		this.op.setLanguage(lang);
	}


   


}
