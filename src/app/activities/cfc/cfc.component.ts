import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PickElementService } from '../../services/pick-element.service';

@Component({
  selector: 'app-cfc',
  templateUrl: './cfc.component.html',
  styleUrls: ['./cfc.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class CfcComponent extends BaseComponent implements OnInit {

	constructor(private elm:ElementRef, 
				private sanitizer: DomSanitizer, 
				private playmedia: PlaymediaService, 
				private cfclog: LoggingService, 
				private cfccs: ColorschemeService,
				private cfcpe: PickElementService) {
		super(elm, sanitizer, playmedia, cfclog, cfccs, cfcpe);
	}

	ngOnInit() {
		this.setHeader();
		this.current_number = +this.data.cross_number;
		this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();
		this.card = this.data;
		this.current_header = this.card.header;
		
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


}