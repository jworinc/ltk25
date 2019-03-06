import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Ar1Component } from '../ar1/ar1.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ar3',
  templateUrl: './ar3.component.html',
  styleUrls: ['./ar3.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar3Component extends Ar1Component implements OnInit {

  constructor(private ar3el:ElementRef, private ar3sn: DomSanitizer, private ar3pm: PlaymediaService, private ar3log: LoggingService, private ar3cs: ColorschemeService) {
  	super(ar3el, ar3sn, ar3pm, ar3log, ar3cs);
  }

  ngOnInit() {
  		this.setHeader();
  		this.user_input_background = {
			'background-color': '#725A3F'
		}
		this.content_right_answer_word = {};
		this.content_right_missing_letter = {};
		this.current_number = +this.data.cross_number;
		this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();

		//	Add card data to the directive that
		this.card = this.data;
		
		//	Set current card header
		this.current_header = this.card.header;

		this.max_presented = this.card.content.length;


		//	User input phase
		this.uinputph = '';


		this.setCard();
  }

  	//	Hint 3 play sound of the blend AR3
	hintLevel3() {
		let that = this;
		//	Sound (letter) to play
		let sp: any;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].digraph_letter;
			if(this.card.content[0].InstHint3.length > 0) {
				let fst = this.card.content[0].InstHint3[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(this.card.content[0].desc);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.ar3pm.sound(fst.audio, function(){});
					this.ar3pm.sound('_s'+sp[0]+sp[1], function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		} 
	}

	//	Hint 1, play letters of the blend for AR3
	hintLevel1() {
		let that = this;
		//	Sound (letter) to play
		let sp: any;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].digraph_letter;
			if(this.card.content[0].InstHint1.length > 0) {
				let fst = this.card.content[0].InstHint1[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.ar3pm.sound(fst.audio, function(){});
					for(let i in sp)
						this.ar3pm.sound('_s'+sp[i], function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		}
	}

	//	Hint 2, play sound, play word, play right letter
	hintLevel2() {
		let that = this;
		//	Sound (letter) to play
		let sp: any;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].digraph_letter;
			if(this.card.content[0].InstHint2.length > 0) {
				let fst = this.card.content[0].InstHint2[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.ar3pm.sound(fst.audio, function(){});
					for(let i in sp)
						this.ar3pm.word(sp[i], function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		} 
	}


}