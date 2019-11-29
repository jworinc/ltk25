import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ccc',
  templateUrl: './ccc.component.html',
  styleUrls: ['./ccc.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class CccComponent extends BaseComponent implements OnInit {

	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private ccclog: LoggingService, private ccccs: ColorschemeService) {
		super(elm, sanitizer, playmedia, ccclog, ccccs);
	}

	ngOnInit() {
		this.setHeader();
		this.current_number = +this.data.cross_number;
		this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();
		this.card = this.data;
		this.current_header = this.card.header;
		
		//	Check for embed block
		this.checkForEmbed();

	}

	//	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'finish';

	public input_data = '';

	public display_letters = '';

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public card: any;
	public current_set = 0;
	public content_timeout: any;


	
	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag: boolean = false;

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				//this.playCardDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
		}
		
	}

	hide() {
		this.prevent_dubling_flag = false;
		//	Hide option buttons
		this.optionHide();
		this.enterHide();
		//	Clear content finish delay timer
		clearTimeout(this.content_timeout);
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		
	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			this.enableNextCard();
		} 
	}

	setFocus(){};

	//	Process embed blocks <!-- wp:core-embed/
	checkForEmbed() {
		let id = '<!-- wp:core-embed/';
		let c = this.card.content;

		let start = c.substr(0, id.length);
		if(start === id){
			console.log('CCC Embed block detected');
			//	Get settings object
			let o = c.match(/\{[\w\s\,\.\"\'\:\;\/\-\_\?\&\=\u0000-\uFFFF]+\}/ig);
			
			if(o !== null && o.length > 0){
				let ob = o[0];
				let obj = JSON.parse(ob);
				if(typeof obj !== 'undefined' && typeof obj.url !== 'undefined' && obj.url !== ''){
					
					//	Check embed provider
					if(obj.providerNameSlug === 'youtube') {

						//	There are four variants of you tube links
						//	https://www.youtube.com/embed/dFvlv3T1Nxg
						//	https://www.youtube.com/watch?v=dFvlv3T1Nxg&feature=youtu.be
						//	https://youtu.be/dFvlv3T1Nxg
						//	https://youtu.be/dFvlv3T1Nxg?t=2
						let lv = [
							'https://www.youtube.com/embed/',
							'https://www.youtube.com/watch?v=',
							'https://youtu.be/'
						];

						//	Define video code id
						let vcode = '';
						for(let i in lv) {
							if(obj.url.substr(0, lv[i].length) === lv[i]){
								vcode = obj.url.substr(lv[i].length, obj.url.length - lv[i].length);
								//	Check for & character
								let r = /\&/;
								if(r.test(vcode)){
									vcode = vcode.split('&')[0];
								}
							}
						}

						//	Create content instance
						this.card.content = '<iframe style="width: 100%; height: 100%;" src="https://www.youtube.com/embed/'+vcode+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

					}
					
					//	Check embed for twitter
					if(obj.providerNameSlug === 'twitter') {

						//	Create content instance
						this.card.content = '<a class="twitter-timeline" style="width: 100%; height: 100%;" href="'+obj.url+'"></a>';

					}
					
				}
			}

		}

	}


}