import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-ar2',
  templateUrl: './ar2.component.html',
  styleUrls: ['./ar2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar2Component extends BaseComponent implements OnInit {

		constructor(private elm:ElementRef, 
								private sanitizer: DomSanitizer, 
								private playmedia: PlaymediaService, 
								private ar2log: LoggingService, 
								private ar2cs: ColorschemeService,
								private op: OptionService) {
  		super(elm, sanitizer, playmedia, ar2log, ar2cs);
    } 

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

		//this.max_presented = this.card.content.length;
		
		//	Define number of repetitions
		this.max_repetitions = this.card.content.length;
		let op = this.op.getOptions();
		this.max_presented = this.getMaxPresented(this.max_repetitions, op);

		//	User input phase
		this.uinputph = '';


		//this.setCard();
    }



    //	Set header for current card
	public current_header = '';
	
	public message = '';

	public current_card_instance = 0;
	
	public expected_string = '';

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public answer_word: any;
	public expected: any;
	public variants: any;
	public dashes: any;
	public content: any;
	public syllables: any;
	public uinputph: any;
	public input_data: any;
	public current_hint_level: any;
	public enable_answer_play: any;

	setCard() {

		//	Data format for Ar2
		/*this.card.content = [{
			desc: 'Please enter the two missing letters in a 4-letter alphabet sequence above.',
			parts: ['wal', 'lop'],
			expected: 2,
			variants: [1, 2, 4, 7, 8]
		}]*/

		this.input_data = 0;

		let content = '';
		let syllables = '';
		let ci = this.current_card_instance;
		
		let bd = this.card.content[ci].breakdown;
		bd = bd.replace(/\,/ig, '');
		let sl = bd.split('-');
		let wp = bd.replace(/\-/ig, '').split('');
		this.answer_word = bd.replace(/\-/ig, '');
		this.card.content[ci].parts = [this.answer_word];
		
		//	Expected result
		this.expected = sl.length;

		this.variants = [sl.length-1, sl.length, sl.length+1, sl.length+2];
		this.variants.sort(function(a, b){return 0.5 - Math.random()});
		
		//	Buffer for dashes, represents particular dashes positions
		this.dashes = [];
		
		//	Index used to define which audio from audio content array link to particular content part
		let play_index = 0;

		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i];

			//	Create box for syllable
			if(typeof cn !== 'undefined' && cn !== '') {
				content += "<span class='card-ar2-syllable'>"+cn+"</span>";
				play_index++;
			}

			//	Create dashes between syllables, check if we have last syllable, dont add dash after that
			if(parseInt(i) !== this.card.content[ci].parts.length - 1) {
				this.dashes.push(false);
				content += "<span class='card-ar2-syllable card-ar2-syllable-dash'><span class='cardar2syllabledashspan'></span></span>";
				
			}

		}

		for(let i in sl){

			let cn = sl[i];

			//	Create box for syllable
			if(typeof cn !== 'undefined' && cn !== '') {
				syllables += "<span class='card-ar2-syllable'>"+cn+"</span>";
			}

			//	Create dashes between syllables, check if we have last syllable, dont add dash after that
			if(parseInt(i) !== sl.length - 1) {
				this.dashes.push(false);
				syllables += "<span class='card-ar2-syllable card-ar2-syllable-dash'><span class='cardar2syllabledashspan'></span></span>";
				
			}

		}

		this.content = content;
		this.syllables = syllables;
		this.clearUserInput();
		
	}


	contentPlay(p) {
		this.playmedia.word(p, function(){});
	}

	syllablePlay(p) {
		this.playmedia.sound(p, function(){});
	}

	stopPlay(){
		this.playmedia.stop();
	}

	//	Validate user answer
	validate(){
		if(this.input_data !== '' && this.input_data == this.expected)
			return true;
		else return false;
	}


	//	Create formated user input string for errors log
	getUserInputString() {
		return this.input_data;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.expected_string;
	}


	//	Handle clicks on buttons, btn - is a button number
	handleAnswer(btn) {
		if(this.validate()) return;
		//	Change style of pushed button
		this.elm.nativeElement.querySelectorAll('button').forEach((e)=>{
			e.classList.remove('btn-success');
			e.classList.remove('btn-warning');
		});
		if(this.expected == btn) this.elm.nativeElement.querySelector('button[data-btn-pos=\''+btn+'\']').classList.add('btn-success');
		else this.elm.nativeElement.querySelector('button[data-btn-pos=\''+btn+'\']').classList.add('btn-warning');

		//	Set user answer
		this.input_data = btn;
		
		//	Validate user answer and enable next slide if it's allright
		if(this.validate()) this.disableMoveNext();
		else {
			//	Log user error
			this.card_object = 'Question';
			this.card_instance = this.expected_string = 'How Many Syllables? ' + this.answer_word + ' ('+this.expected+')';
			this.result();
			this.disableMoveNext();
			this.enter();
		}
		this.checkIfComplete();

	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			//if(!this.validate()) {
				this.current_presented = 1;
				this.current_card_instance = 0;
				this.elm.nativeElement.querySelector('.card-syllables-body-wrap-ar2').style.opacity = '0';
				this.setCard();
				//	Play card description
				this.playCardDescription();
				this.disableMoveNext();
				this.disableNextSlide();
			//} else {
			//	this.enableMoveNext();
			//}
			this.prevent_dubling_flag = true;
			this.showHint();
			this.input_data = 0;
		}
		
	}

	next() {
		if(this.current_presented < this.max_presented) this.repeat();
	}
	
	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		if(typeof this.card.content[0].LoopInst !== 'undefined' && this.card.content[0].LoopInst.length > 0){
			this.card.content[0].desc = this.card.content[0].LoopInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.playmedia.sound(this.card.content[0].LoopInst[0].audio, function(){}, 1500);
			this.playmedia.word(this.answer_word, function(){ that.setFocus(); });
		}
	}
	
	//	Set dash handler
	setDash(d) {
		if(this.dashes.length > d && !this.dashes[d]) this.dashes[d] = true;
		else if(this.dashes.length > d && this.dashes[d]) this.dashes[d] = false;
		
	}
	
	//	Reset user input
	clearUserInput() {
		this.elm.nativeElement.querySelectorAll('button').forEach((e)=>{
			e.classList.remove('btn-success');
			e.classList.remove('btn-warning');
		});
		this.input_data = 0;
		
	}
	
	setFocus() {
		
	}

	hint() {
		if(this.validate()) return;
		let that = this;
		this.current_hint_level = 1;
		this.elm.nativeElement.querySelector('.card-syllables-body-wrap-ar2').style.opacity = '1';
		setTimeout(function(){ that.elm.nativeElement.querySelector('.card-syllables-body-wrap-ar2').style.opacity = '0';; }, 3000);
	}

	checkIfComplete() {

		//	Filter all user data 
		this.input_data = +this.input_data;
		
		//	Get user answer
		let result = this.input_data;
		let that = this;
		//	If user input is not wrong
		if(result === this.expected){

			this.elm.nativeElement.querySelector('.card-syllables-body-wrap-ar2').style.opacity = '1';

			if(this.current_presented < this.max_presented){
				this.playmedia.action('CHIMES', function(){

					//	Play 'The word is...'
					if(that.card.content[0].RespAtEnd.length > 0) {
						let fst = that.card.content[0].RespAtEnd[0];
						that.card.content[0].desc = fst.pointer_to_value;
						that.setGlobalDesc(fst.pointer_to_value);
						if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
							that.playmedia.sound(fst.audio, function(){
								that.elm.nativeElement.querySelector('.card-syllables-body-wrap-ar2').style.opacity = '0';
							});
							that.playmedia.word(that.answer_word, function(){ 

								//	Continue with next word
								that.current_card_instance++;
								that.input_data = 0;
								that.setCard();
								setTimeout(function(){ 
									that.current_presented++; 
									that.playContentDescription();
								}, 300);

							});
						}
					}

					
				}, 300);
					
			} else {
			
				//	Answer is right, play end instruction
				that.enable_answer_play = true;
				that.stopPlay();
				if(that.card.content[0].RespAtEnd.length > 0) {
					let fst = that.card.content[0].RespAtEnd[0];
					that.card.content[0].desc = fst.pointer_to_value;
					that.setGlobalDesc(fst.pointer_to_value);
					if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
						that.playmedia.sound(fst.audio, function(){});
						that.playmedia.word(that.answer_word, function(){ 
							that.playCorrectSound(function(){ 
								that.enableMoveNext(); that.moveNext();
							});
						});
					}
				}
			}
		}
		//	If current card is active
		/*
		if(this.isActive()){
			let scope = this;
			//	Validate user input and decide enable or not next card
				if(scope.validate()) scope.enableMoveNext();
				else scope.disableMoveNext();
			
		}
		*/
		
	}

	enter(silent = false) {
		let that = this;
		this.playmedia.stop();
		if(!this.validate()){
			if(!silent && this.getUserInputString() !== 0){
				this.playmedia.sound('_STNQR', function(){ 
					that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; //scope.playCardDescription();
				}, 0);
			} 
			else if(!silent && this.getUserInputString() === 0){
				this.repeat();
			}
			else {
				that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; //scope.playCardDescription();
			}
		} else {

			//	Check if we shown all card instances
			if(that.current_presented >= that.max_presented){
				if(!silent && this.getUserInputString() !== 0){
					this.playCorrectSound(function(){ 
						that.enableNextCard();
					});
				} else {
					that.enableNextCard();
				}
			}
		}
	}



}