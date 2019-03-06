import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Ar5Component } from '../ar5/ar5.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ar6',
  templateUrl: './ar6.component.html',
  styleUrls: ['./ar6.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar6Component extends Ar5Component implements OnInit, DoCheck {

  constructor(private ar6el:ElementRef, private ar6sn: DomSanitizer, private ar6pm: PlaymediaService, private ar6log: LoggingService, private ar6cs: ColorschemeService) {
  	super(ar6el, ar6sn, ar6pm, ar6log, ar6cs);
  }

  public index_for_required_letter: number = -1;
  public r: any;
  public expected_1: any;
  public expected_2: any;
  public expected_3: any;
  public the_word_raw: any;

  ngOnInit() {
  	this.setHeader();
	this.current_number = +this.data.cross_number;
	this.card_id = this.data.id;
	this.setCardNumber();
	//this.setCardId();
	//	Add card data to the directive scope
	this.card = this.data;
	//	Set current card header
	this.current_header = this.card.header;
	this.max_presented = this.card.content.length;

	this.setCard();

	this.old_input_data = JSON.stringify(this.input_data);
  }
		
	setCard() {
		
		//	Init input data
		this.input_data = '';
		this.current_hint_level = 0;
		let ci = this.current_card_instance;
		this.expected_string = '';
		this.old_input_data = JSON.stringify(this.input_data);
		
		//	Expected test regex
		let r = null;
		this.r = r = /\|{1}[A-Za-z]+\|{1}/;

		//	Regex to remove vertical slashes
    	let s = /\|/ig;

		//	Add word parts to markup
		if(this.card.content[ci].parts.length >= 3){

			//	Get letters
			this.letter_1 = this.card.content[ci].parts[0];
			this.letter_2 = this.card.content[ci].parts[1];
			this.letter_3 = this.card.content[ci].parts[2];
			this.letter_4 = '';

			this.the_word_raw = this.letter_1 + this.letter_2 + this.letter_3;
			this.the_word = this.the_word_raw.replace(s, '');

			//	Get position of expected letter
	    	this.expected_1 = r.test(this.letter_1);
	    	this.expected_2 = r.test(this.letter_2);
	    	this.expected_3 = r.test(this.letter_3);

	    	//	Filter letters to remove special characters
	    	this.letter_1 = this.letter_1.replace(s, '');
	    	this.letter_2 = this.letter_2.replace(s, '');
	    	this.letter_3 = this.letter_3.replace(s, '');
		}

		this.card_object = 'Sound';
		this.card_instance = this.the_word;

		//	Set expected letter for validation of user input
		this.expected = this.expected_1 ? this.letter_1 : this.expected_2 ? this.letter_2 : this.expected_3 ? this.letter_3 : 'None';
		//	Set audio index for expected letter
		this.index_for_required_letter = this.expected_1 ? 0 : this.expected_2 ? 1 : this.expected_3 ? 2 : -1;
		//	Fill expected string for logging
		for(let i in this.card.content[ci].parts){
			if(parseInt(i) === this.index_for_required_letter) this.expected_string += '(' + this.card.content[ci].parts[i].replace(s, '') + ')';
			else this.expected_string += this.card.content[ci].parts[i];
		}
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {

		this.setFocus();
		
		let i: any = null;
		if(this.expected_1){
			i = this.card.content[0].InstBeg[0];
		}
		else if(this.expected_2){
			i = this.card.content[0].InstMid[0];
		}
		else if(this.expected_3){
			i = this.card.content[0].InstEnd[0];
		}
		this.card.content[0].desc = i.pointer_to_value;
		this.setGlobalDesc(i.pointer_to_value);
		if(typeof i.audio !== 'undefined' && i.audio !== ''){

			this.ar6pm.sound(i.audio, function(){}, 300);
			this.ar6pm.word(this.letter_1+this.letter_2+this.letter_3, function(){}, 300);

		}
	}

	
	ngDoCheck() {
	    //	If page is active and user input some data
		if(this.isActive() && JSON.stringify(this.input_data).toLowerCase() !== this.old_input_data.toLowerCase() && this.input_data !== ""){
			//	Filter all user data with transformation to lower case and 1 letter restriction
			this.input_data = this.input_data.toLowerCase();
			this.input_data = this.input_data.split('')[0];
			this.old_input_data = JSON.stringify(this.input_data);
			
			let that = this;
			//	Validate user input and decide to enable next card or not
			if(that.validate()){
				
				if(that.current_presented < that.max_presented){
					that.ar6pm.action('CHIMES', function(){
						that.current_card_instance++;
						that.setCard();
						setTimeout(function(){ 
							that.current_presented++;
							that.playCardDescription();
							that.disableMoveNext();
						}, 300);
					}, 300);
						
				} else {
					that.handleLetterFocus();
					that.enter();
					
				}
				
			} 
			else that.disableMoveNext();

		}
	}


}