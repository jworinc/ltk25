import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasearComponent } from '../basear/basear.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ar5',
  templateUrl: './ar5.component.html',
  styleUrls: ['./ar5.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar5Component extends BasearComponent implements OnInit, DoCheck {

    constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private ar5log: LoggingService, private ar5cs: ColorschemeService) {
  	  super(element, sz, pms, ar5log, ar5cs);
    }

    public letter_1: string;
    public letter_2: string;
    public letter_3: string;
    public letter_4: string;
	public show_letter_4: boolean = false;
	public play_stop_cycle_timer: any = null;
	public letters_cycle_started: boolean = false;
	public the_word: any;
	public hint_3_letter_1: any;
	public hint_3_letter_2: any;
	public hint_3_letter_3: any;
	public hint_3_letter_4: any;
	public hint_4_started: boolean = false;

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
		this.old_input_data = JSON.stringify(this.input_data);

		//	Add word parts to markup
		if(this.card.content[this.current_card_instance].parts.length >= 3){

			this.letter_1 = this.card.content[this.current_card_instance].parts[0];
			this.letter_2 = this.card.content[this.current_card_instance].parts[1];
			this.letter_3 = this.card.content[this.current_card_instance].parts[2];
			this.letter_4 = '';
			if(this.card.content[this.current_card_instance].parts.length>3){
				this.letter_4 = this.card.content[this.current_card_instance].parts[3];
				this.show_letter_4 = true;
			}
			this.the_word = this.letter_1 + this.letter_2 + this.letter_3 + this.letter_4;

		}

		//	Info for logging
		this.card_object = 'Sound';
		this.card_instance = this.the_word;


		this.expected = '';
		this.expected_string = '';
		let vovels = ['a', 'e', 'i', 'o', 'u'];
		for(var i in this.card.content[this.current_card_instance].parts){
			var p = this.card.content[this.current_card_instance].parts[i];
			if(vovels.indexOf(p.toLowerCase()) >= 0){ 
				this.expected = p; 
				//break; 
				this.expected_string += '('+p+')';
			} else {
				this.expected_string += p;
			}
		}
		

	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				//	Set focus on first empty input element
				//this.setFocus();
				//	Play card description
				this.playCardDescription();
				this.disableMoveNext();
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.showHint();
		}
		
	}

	//	Set focus on empty input
	setFocus() {
		let e = this.element.nativeElement.querySelector('.card-input-ar5');
		if(typeof e !== 'undefined' && e !== null){
			e.focus();
		}
	}
	
	hintLevel2() {
		let scope = this;
		
		if(this.card.content[0].InstHint2.length > 0) {
			let fst = this.card.content[0].InstHint2[0];
			this.card.content[0].desc = fst.pointer_to_value;
			this.setGlobalDesc(fst.pointer_to_value);
			if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
				this.pms.sound(fst.audio, function(){});
				this.pms.word(this.expected, function(){ scope.hint_busy = false; scope.setFocus(); });
			} else {
				setTimeout(function(){
					
					scope.hint_busy = false; scope.setFocus(); 
					
				}, 3000);
			}
		}	
	}


	hintLevel1() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_1_started) return;
		this.hint_1_started = true;
		//	Show word
		this.hint_2_show = {
			'opacity': '1'
		}
		
		let that = this;

		//	Start delay and on expires hide the word
		setTimeout(function() {
			that.hint_2_show = {
    			'opacity': '0'
    		}
    		that.hint_1_started = false;
    		
		}, this.hint_delay*3);

		setTimeout(function(){ that.hint_busy = false; that.setFocus(); }, 1000);
	}

	
	hintLevel3() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_3_started) return;
		this.hint_3_started = true;

		this.hintLevel1();

		let that = this;

		if(this.card.content[0].InstHint3.length > 0) {
			let fst = this.card.content[0].InstHint3[0];
			this.card.content[0].desc = fst.pointer_to_value;
			this.setGlobalDesc(fst.pointer_to_value);
			if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
				this.pms.sound(fst.audio, function(){});
				this.pms.word(this.letter_1+this.letter_2+this.letter_3+this.letter_4, function(){
					if(that.card.content[0].InstHint3.length > 1) {
						let fst = that.card.content[0].InstHint3[1];
						that.card.content[0].desc = fst.pointer_to_value;
						that.setGlobalDesc(fst.pointer_to_value);
						if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
							that.pms.sound(fst.audio, function(){});
							that.pms.word(that.expected, function(){
								that.hint_busy = false; that.setFocus();
								that.hint_3_started = false;
							});
						} else {
							setTimeout(function(){
								
								that.hint_busy = false; that.setFocus(); 
								that.hint_3_started = false;
								
							}, 3000);
						}
					}	
				});
			} else {
				setTimeout(function(){
					
					that.hint_busy = false; that.setFocus();
					that.hint_3_started = false; 
					
				}, 3000);
			}
		}	

	}
	
	
	showCycleFromLetters() {

		if(this.letters_cycle_started) return;

		//	Show separate letters sequence
		this.hint_3_show = {
			'opacity': '1'
		}
		
		let that = this;

		//	Start cycle for highlight each letter one by one and play
		//	appropriate sound for aech letter
		this.play_stop_cycle_timer = setTimeout(function() {
			that.hint_3_letter_1 = {
    			'background-color': 'yellow'
    		}
    		
    		that.pms.sound('_S'+that.letter_1, function(){});
    		that.play_stop_cycle_timer = setTimeout(function() {
    			that.hint_3_letter_2 = {
	    			'background-color': 'yellow'
	    		}
	    		that.hint_3_letter_1 = {};
	    		
	    		that.pms.sound('_S'+that.letter_2, function(){});
	    		that.play_stop_cycle_timer = setTimeout(function() {
	    			that.hint_3_letter_3 = {
		    			'background-color': 'yellow'
		    		}
		    		that.hint_3_letter_2 = {};
		    		
		    		let l3 = that.letter_3;
		    		if(that.letter_3.length === 2 && that.letter_3.split('')[0] === that.letter_3.split('')[1]) l3 = that.letter_3.split('')[0];
		    		that.pms.sound('_S'+l3, function(){});
		    		that.play_stop_cycle_timer = setTimeout(function() {
			    		that.hint_3_letter_3 = {};
			    		that.hint_3_started = false;
			    		if(that.letter_4 === ''){
			    			that.hint_3_show = {
				    			'opacity': '0'
				    		}
				    		that.hint_busy = false;
				    		that.setFocus();
				    		that.hintLevel1();
				    		that.pms.word(that.letter_1+that.letter_2+that.letter_3+that.letter_4, function(){
								
								that.continueOrFinishCard();
				    		});
				    	} else {
				    		that.hint_3_letter_4 = {
				    			'background-color': 'yellow'
				    		}
				    		
				    		let l4 = that.letter_4;
		    				if(that.letter_4.length === 2 && that.letter_4.split('')[0] === that.letter_4.split('')[1]) l4 = that.letter_4.split('')[0];
				    		that.pms.sound('_S'+l4, function(){});
				    		that.play_stop_cycle_timer = setTimeout(function() {
				    			that.hint_3_show = {
					    			'opacity': '0'
					    		}
					    		that.hint_3_letter_4 = {};
					    		that.hint_4_started = false;
					    		that.hint_busy = false;
					    		that.setFocus();
					    		that.hintLevel1();
					    		that.pms.word(that.letter_1+that.letter_2+that.letter_3+that.letter_4, function(){
									that.continueOrFinishCard();
									
					    		});
						    	
				    		}, that.hint_delay);
				    	}
		    		}, that.hint_delay);
	    		}, that.hint_delay);
    		}, that.hint_delay);
		}, that.hint_delay);
	}

	//	Handle letter focus callback, performs when input element receive focus
	handleLetterFocus() {
		let d = this.input_data;
		//	If input letter is right, remove focus, else clear letter
		if(d === this.expected) {
			this.element.nativeElement.querySelector('.card-input-ar5').blur();
		} else {
			d = '';
		}
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		this.setFocus();
		let scope = this;
		if(this.letter_2 !== '' && this.letter_2.length === 1){
			this.pms.word(this.letter_1+this.letter_2+this.letter_3+this.letter_4, function(){}, 300);
			this.pms.word(this.expected, function(){ scope.hint_busy = false; scope.setFocus(); }, 300);
		}
	}

	ngDoCheck() {
	    //	If page is active and user input some data
		if(this.isActive() && JSON.stringify(this.input_data).toLowerCase() !== this.old_input_data.toLowerCase() && this.input_data !== ""){
			//	Filter all user data with transformation to lower case and 1 letter restriction
			this.input_data = this.input_data.toLowerCase();
			this.input_data = this.input_data.split('')[0];
			this.old_input_data = JSON.stringify(this.input_data);
			
			//	Validate user input and decide to enable next card or not
			if(this.validate()){
				//scope.enableMoveNext();
				this.showCycleFromLetters();
				this.handleLetterFocus();
			} 
			else this.disableMoveNext();

		}
	}

}