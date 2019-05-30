import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-al2',
  templateUrl: './al2.component.html',
  styleUrls: ['./al2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Al2Component extends BaseComponent implements OnInit, DoCheck {

		constructor(private elm:ElementRef, 
								private sanitizer: DomSanitizer, 
								private playmedia: PlaymediaService, 
								private al2log: LoggingService, 
								private al2cs: ColorschemeService,
								private op: OptionService) {
  		super(elm, sanitizer, playmedia, al2log, al2cs);
  	}

  	ngOnInit() {
  		this.setHeader();
  		//	Define current card number
			this.current_number = +this.data.cross_number;
			this.card_id = this.data.id;
			this.setCardNumber();
			//this.setCardId();

			this.card = this.data;
			
			this.current_header = this.card.header;
			
			//	Data format for AL2
			/*this.card.content = [{
				desc: 'Please enter the two missing letters in a 4-letter alphabet sequence above.',
				parts: [

					{ letter: 'A', expected: '' },
					{ letter: 'B', expected: '' },
					{ letter: '', expected: 'C' },
					{ letter: '', expected: 'D' }

				]
			}]*/

			//if(typeof this.card.content[0].RepeatCount !== 'undefined') this.max_presented = parseInt(this.card.content[0].RepeatCount);

			//	Define number of repetitions
			let max = this.max_repetitions;
			let op = this.op.getOptions();
			this.max_presented = this.getMaxPresented(max, op);

			this.setCard();

  	}


  	//	Set header for current card
	public current_header = '';
	
	public message = '';

	public current_hint_level = 0;

	public max_hint_level = 3;

	public clets = [
		[{ letter: 'A', expected: '' }, { letter: 'B', expected: '' }, { letter: '', expected: 'C' }, { letter: '', expected: 'D' }], //
		[{ letter: 'A', expected: '' }, { letter: '', expected: 'B' }, { letter: 'C', expected: '' }, { letter: '', expected: 'D' }], //
		[{ letter: 'C', expected: '' }, { letter: '', expected: 'D' }, { letter: '', expected: 'E' }, { letter: 'F', expected: '' }], //
		[{ letter: 'H', expected: '' }, { letter: 'I', expected: '' }, { letter: '', expected: 'J' }, { letter: '', expected: 'K' }], //
		[{ letter: '', expected: 'H' }, { letter: '', expected: 'I' }, { letter: 'J', expected: '' }, { letter: 'K', expected: '' }], //
		[{ letter: 'H', expected: '' }, { letter: 'I', expected: '' }, { letter: '', expected: 'J' }, { letter: '', expected: 'K' }], //
		[{ letter: '', expected: 'E' }, { letter: '', expected: 'F' }, { letter: 'G', expected: '' }, { letter: 'H', expected: '' }], //
		[{ letter: 'E', expected: '' }, { letter: 'F', expected: '' }, { letter: '', expected: 'G' }, { letter: '', expected: 'H' }], //
		[{ letter: 'L', expected: '' }, { letter: 'M', expected: '' }, { letter: '', expected: 'N' }, { letter: '', expected: 'O' }], //
		[{ letter: '', expected: 'L' }, { letter: 'M', expected: '' }, { letter: '', expected: 'N' }, { letter: 'O', expected: '' }], //
		[{ letter: 'L', expected: '' }, { letter: '', expected: 'M' }, { letter: '', expected: 'N' }, { letter: 'O', expected: '' }], //
		[{ letter: 'I', expected: '' }, { letter: 'J', expected: '' }, { letter: '', expected: 'K' }, { letter: '', expected: 'L' }], //
		[{ letter: 'I', expected: '' }, { letter: '', expected: 'J' }, { letter: 'K', expected: '' }, { letter: '', expected: 'L' }], //
		[{ letter: '', expected: 'I' }, { letter: '', expected: 'J' }, { letter: 'K', expected: '' }, { letter: 'L', expected: '' }], //
		[{ letter: 'F', expected: '' }, { letter: 'G', expected: '' }, { letter: '', expected: 'H' }, { letter: '', expected: 'I' }], //
		[{ letter: 'F', expected: '' }, { letter: '', expected: 'G' }, { letter: 'H', expected: '' }, { letter: '', expected: 'I' }], //
		[{ letter: '', expected: 'F' }, { letter: '', expected: 'G' }, { letter: 'H', expected: '' }, { letter: 'I', expected: '' }], //
		[{ letter: 'J', expected: '' }, { letter: 'K', expected: '' }, { letter: '', expected: 'L' }, { letter: '', expected: 'M' }], //
		[{ letter: 'J', expected: '' }, { letter: '', expected: 'K' }, { letter: 'L', expected: '' }, { letter: '', expected: 'M' }], //
		[{ letter: '', expected: 'J' }, { letter: '', expected: 'K' }, { letter: 'L', expected: '' }, { letter: 'M', expected: '' }], //
		[{ letter: 'R', expected: '' }, { letter: 'S', expected: '' }, { letter: '', expected: 'T' }, { letter: '', expected: 'U' }], //
		[{ letter: 'R', expected: '' }, { letter: '', expected: 'S' }, { letter: '', expected: 'T' }, { letter: 'U', expected: '' }], //
		[{ letter: '', expected: 'R' }, { letter: '', expected: 'S' }, { letter: 'T', expected: '' }, { letter: 'U', expected: '' }], //
		[{ letter: 'P', expected: '' }, { letter: 'Q', expected: '' }, { letter: '', expected: 'R' }, { letter: '', expected: 'S' }], //
		[{ letter: '', expected: 'P' }, { letter: 'Q', expected: '' }, { letter: '', expected: 'R' }, { letter: 'S', expected: '' }], //
		[{ letter: 'P', expected: '' }, { letter: 'Q', expected: '' }, { letter: 'R', expected: '' }, { letter: '', expected: 'S' }], //
		[{ letter: 'O', expected: '' }, { letter: 'P', expected: '' }, { letter: '', expected: 'Q' }, { letter: '', expected: 'R' }], //
		[{ letter: 'O', expected: '' }, { letter: '', expected: 'P' }, { letter: 'Q', expected: '' }, { letter: '', expected: 'R' }], //
		[{ letter: '', expected: 'N' }, { letter: 'O', expected: '' }, { letter: '', expected: 'P' }, { letter: 'Q', expected: '' }], //
		[{ letter: 'N', expected: '' }, { letter: 'O', expected: '' }, { letter: '', expected: 'P' }, { letter: '', expected: 'Q' }], //
		[{ letter: '', expected: 'B' }, { letter: '', expected: 'C' }, { letter: 'D', expected: '' }, { letter: 'E', expected: '' }], //
		[{ letter: 'B', expected: '' }, { letter: '', expected: 'C' }, { letter: 'D', expected: '' }, { letter: '', expected: 'E' }], //
		[{ letter: 'U', expected: '' }, { letter: 'V', expected: '' }, { letter: 'W', expected: '' }, { letter: '', expected: 'X' }], //
		[{ letter: '', expected: 'U' }, { letter: '', expected: 'V' }, { letter: 'W', expected: '' }, { letter: 'X', expected: '' }], //
		[{ letter: 'U', expected: '' }, { letter: '', expected: 'V' }, { letter: 'W', expected: '' }, { letter: '', expected: 'X' }], //
		[{ letter: 'W', expected: '' }, { letter: 'X', expected: '' }, { letter: '', expected: 'Y' }, { letter: '', expected: 'Z' }], //
		[{ letter: 'W', expected: '' }, { letter: '', expected: 'X' }, { letter: 'Y', expected: '' }, { letter: '', expected: 'Z' }], //
		[{ letter: '', expected: 'W' }, { letter: '', expected: 'X' }, { letter: 'Y', expected: '' }, { letter: 'Z', expected: '' }], //
		[{ letter: '', expected: 'V' }, { letter: '', expected: 'W' }, { letter: 'X', expected: '' }, { letter: 'Y', expected: '' }], //
		[{ letter: 'V', expected: '' }, { letter: 'W', expected: '' }, { letter: '', expected: 'X' }, { letter: '', expected: 'Y' }], //
		[{ letter: 'S', expected: '' }, { letter: 'T', expected: '' }, { letter: '', expected: 'U' }, { letter: '', expected: 'V' }], //
		[{ letter: '', expected: 'S' }, { letter: '', expected: 'T' }, { letter: 'U', expected: '' }, { letter: 'V', expected: '' }], //
		[{ letter: 'Q', expected: '' }, { letter: 'R', expected: '' }, { letter: '', expected: 'S' }, { letter: '', expected: 'T' }], //
		[{ letter: 'Q', expected: '' }, { letter: '', expected: 'R' }, { letter: 'S', expected: '' }, { letter: '', expected: 'T' }], //
		[{ letter: '', expected: 'K' }, { letter: '', expected: 'L' }, { letter: 'M', expected: '' }, { letter: 'N', expected: '' }], //
		[{ letter: 'K', expected: '' }, { letter: 'L', expected: '' }, { letter: '', expected: 'M' }, { letter: '', expected: 'N' }], //
		[{ letter: '', expected: 'G' }, { letter: 'H', expected: '' }, { letter: 'I', expected: '' }, { letter: '', expected: 'J' }], //
		[{ letter: 'G', expected: '' }, { letter: 'H', expected: '' }, { letter: '', expected: 'I' }, { letter: '', expected: 'J' }], //
		[{ letter: 'D', expected: '' }, { letter: 'E', expected: '' }, { letter: '', expected: 'F' }, { letter: '', expected: 'G' }], //
		[{ letter: '', expected: 'D' }, { letter: '', expected: 'E' }, { letter: 'F', expected: '' }, { letter: 'G', expected: '' }], //
	];

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public input_data: any;
	public expected: any;
	public hint_busy: boolean = false;
	public cn = [];
	public exp_arr = [];
	
	setCard() {

		//	Clear previous card content
		//this.elm.nativeElement.querySelector('.card-content-body-wrap-al2').innerHTML = '';
		//this.elm.nativeElement.querySelector('.card-content-body-hint-al2').innerHTML = '';
		this.current_hint_level = 0;


		this.card.content[0].parts = this.clets[Math.floor(Math.random() * (this.clets.length - 1))];

		this.input_data = [];

		let content = '';
		this.expected = '';
		this.cn = [];
		this.exp_arr = [];

		this.card_object = 'letter';
		this.card_instance = this.getExpectedString();

		//	Index used to define which audio from audio content array link to particular content part
		let play_index = 0;
		
		for(let i in this.card.content[0].parts){

			this.cn.push(this.card.content[0].parts[i]);
			this.input_data[i] = '';

			let cni = this.card.content[0].parts[i];

			if(typeof cni.letter !== 'undefined' && cni.letter !== '') {
				play_index++;
			} 
			//	Check if we have input box
			else if( typeof cni.expected !== 'undefined' && cni.expected !== '') {
				
				if(this.expected === ''){
					this.expected = cni.expected;
				} else {
					this.expected += ', ' + cni.expected;
				}
				this.exp_arr.push(cni.expected);
			}
		}


		this.old_input_data = JSON.stringify(this.input_data);
		

	}



	//	Validation of user input
	validate() {

		//	Additional task for this function to set focus on input elements
		if(this.isActive()){
			//this.setFocus();
		}

		let parts = [];
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			parts = this.card.content[0].parts;
		}
		
		//	Calc how many letters was entered by user
		let remains = 0;
		for(let i in this.input_data) {
			let d = this.input_data[i];
			let index = +i;
			if(parts[index].expected === "") continue;
			if(d == '') {
				remains++;
			}
			else if(parts.length > 0 && parts[index].expected !== d){
				remains++;
			}
		};

		//	When all required letters was entered, check if answer is match with required
		if(remains === 0){
			return true;
		} else {
			return false;
		}

	}

	//	Create formated user input string for errors log
	getUserInputString() {
		let s = '';
		for(let i in this.input_data) {
			let d = this.input_data[i];
			let index = +i;
			if(d !== '') {

				if(s === '') s = d.toLowerCase();
				else s+=', ' + d.toLowerCase();

			}
		};
		return s;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		let s = '';
		for(let i in this.card.content[0].parts) {
			let d = this.card.content[0].parts[i];
			let index = +i;
			if(d.expected !== '') {

				if(s === '') s = d.expected.toLowerCase();
				else s+=', ' + d.expected.toLowerCase();

			}
		};
		return s;
	}

	//	Set focus on first empty input
	setFocus() {
		let set_focus = false;
		for(let i in this.input_data) {
		    let d = this.input_data[i];
		    let index = +i;
			if(!set_focus && d == ''){
				
				let inps = this.elm.nativeElement.querySelector('input[data-pos="'+index+'"]');
				if(inps !== null){
					set_focus = true;
					setTimeout(function() { inps.focus(); }, 100);
				}
				
			}

		};

		if(!set_focus){
			this.elm.nativeElement.querySelectorAll('input').forEach((e)=>{
				e.blur();
			});
		}

	}

	//	Clear wrong inputs
	clearUserInput() {
		let parts = [];
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			parts = this.card.content[0].parts;
		}
		
		//	Clear letters that was entered by user
		for(let i in this.input_data) {
			let d = this.input_data[i];
			let index = +i;
			if(parts.length > 0 && parts[index].expected !== '' && parts[index].expected !== d){
				this.input_data[index] = '';
			}
		};
		
	}

	//	Filter user input
	al2filter(inp) {
		if(inp === "") return "";
		let out = inp.toUpperCase();
		return out.split('')[0];
	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()){
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

	playRightAnswer(){
		let that = this;
		let parts = [];
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			parts = this.card.content[0].parts;
			this.playmedia.word(parts[0].letter !== '' ? parts[0].letter : parts[0].expected, function(){});
			this.playmedia.word(parts[1].letter !== '' ? parts[1].letter : parts[1].expected, function(){});
			this.playmedia.word(parts[2].letter !== '' ? parts[2].letter : parts[2].expected, function(){});
			this.playmedia.word(parts[3].letter !== '' ? parts[3].letter : parts[3].expected, function(){
				that.enableNextCard();
			});
					
		} else {
			this.enableNextCard();
		}
		
	}

	hint() {
		if(this.hint_busy) return;
		this.hint_busy = true;
		this.current_hint_level++;
		if(this.current_hint_level > this.max_hint_level) this.current_hint_level = this.max_hint_level;
		if(this.current_hint_level === 1) this.hintLevel1();
		else if(this.current_hint_level === 2) this.hintLevel2();
		else if(this.current_hint_level === 3) this.hintLevel3();
	};

	hintLevel1() {
		let that = this;
		let parts = [];
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			for(let k in this.card.content[0].parts){
				if(typeof this.card.content[0].parts[k].expected !== 'undefined' && this.card.content[0].parts[k].expected !== ''){
					parts.push(this.card.content[0].parts[k]);
				}
			}
			
			for(let i in parts){
				let p = parts[i];
				
				if(+i < parts.length - 1)
					this.playmedia.word(p.expected, function(){});
				else
					this.playmedia.word(p.expected, function(){ that.hint_busy = false; that.setFocus(); });
			
			}
			
		} 
	}

	hintLevel2() {
		
		let that = this;
		this.elm.nativeElement.querySelectorAll('.card-content-body-hint-al2 span').forEach((e)=>{
			e.style.opacity = '1';
		});
		setTimeout(function(){
			that.elm.nativeElement.querySelectorAll('.card-content-body-hint-al2 span').forEach((e)=>{
				e.style.opacity = '0';
			});
			that.hint_busy = false;
			that.setFocus();
		}, 2000);
	}

	hintLevel3() {
		this.hintLevel1();
		this.hintLevel2();
	}

	playMediaWord(w) {
		this.playmedia.word(w, function(){});
	}


	//	Watch if user type any data
	ngDoCheck() {
	    //const change = this.differ.diff(this.input_data);
	    if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){
	    	
	    	console.log('collection changed');

	    	for(let i in this.input_data){
	    		let d = this.input_data[i];
	    		let index = +i;
	    		this.input_data[index] = this.al2filter(d);
	    	}

	    	this.old_input_data = JSON.stringify(this.input_data);

	    	let that = this;
			if(!this.validate()){
				this.disableMoveNext();
			} else {
				if(this.current_presented < this.max_presented){
					this.playmedia.action('CHIMES', function(){
						that.setCard();
						setTimeout(function(){ that.current_presented++; that.setFocus(); }, 300);
					}, 300);
						
				} else {
					this.enter();
					
				}
			
			}

			this.setFocus();

	    }
	    
	}



}