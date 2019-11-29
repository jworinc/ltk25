import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-spl',
  templateUrl: './spl.component.html',
  styleUrls: ['./spl.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class SplComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private spllog: LoggingService, private splcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, spllog, splcs);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
	//this.setCardId();
	this.card = this.data;
	this.current_header = this.card.header;
	this.setCard();
  }

    	//	Set header for current card
		public current_header = '';
		
		//	User answer phases, rec, listen, compare, split to syllables, finish
		public uinputph = 'rec';

		public input_data = '';

		public display_letters = '';

		//	Define current card number
		public current_number = 0;
		public card_id = 0;
		public card: any;
		public current_set = 0;
		public content_timeout: any;


		setCard() {

			if(typeof this.card.content[0].letter !== 'undefined'){
				if(this.card.content[0].letter === 'Vowels - All'){
					this.display_letters = 'A, E, I, O, U';
				}
				else if(this.card.content[0].letter === 'Consonants - All'){
					this.display_letters = 'B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y (sometimes), and Z';
				}
			}

		}

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
					this.playCardDescription();
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
			let that = this;
			let del = 1;
			//	After card description set delay to allow user to learn content
			if(typeof this.card.content[0].delay !== 'undefined'){
				let del = parseInt(this.card.content[0].delay);
			} else {
				let del = 1;
			}
			//	Finish card after delay
			this.content_timeout = setTimeout(function(){
				that.uinputph = 'finish';
				that.enter();
			}, del*1000);
		}

		//	Enter click handler
		enter() {
			if(this.uinputph === 'finish'){
				this.enableNextCard();
			} 
		}

		setFocus(){};


}