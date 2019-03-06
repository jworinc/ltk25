import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-dis',
  templateUrl: './dis.component.html',
  styleUrls: ['./dis.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class DisComponent extends BaseComponent implements OnInit {

	@ViewChild(PlaysentenceDirective) psn;

    constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private dislog: LoggingService, private discs: ColorschemeService) {
  	  super(elm, sanitizer, playmedia, dislog, discs);
    }

    ngOnInit() {
    	this.setHeader();
    	this.current_number = +this.data.cross_number;
    	this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();

		this.card = this.data;
		
		this.current_header = this.card.header;

		this.max_presented = this.card.content.length;

		this.setCard();

    }


    //	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_hint_level = 0;

	public max_hint_level = 3;

	public current_card_instance = 0;
	
	public expected_string = '';

	public user_answers = '';

	public answer_sent = '';

	public letters = [];

	public played_words = [];

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	public max_presented = 1;

	public sentence_index: any;
	public hint1_str = '';
	public hint2_str = '';
	public hint3_str = '';

	public playsentence_started_flag: boolean = false;

	public hint_1_started: boolean = false;
	public hint_2_started: boolean = false;
	public hint_3_started: boolean = false;
	public hint_busy: boolean = false;

	public hint_string = '';
	public input_data: any;

	/*
	$element.find('.dis-input-wrap input').bind('keyup keydown keypress', function(e){
		e.stopPropagation();
	})
	*/


	setCard() {

		let ci = this.current_card_instance;

		this.input_data = '';

		this.answer_sent = '';
		
		this.user_answers = '';
		
		//	Create list of word/image content of the card
		let content = '';

		this.sentence_index = Math.floor(Math.random() * 100000);

		//	Get current list item
		this.answer_sent = this.card.content[ci].parts.title.replace(/(\(|\))/ig, '');

		//	Setup default hint strings for current input state
		let w = this.answer_sent.trim().split(' ')[0];
		this.hint1_str = w.substring(0, 1);
		this.hint2_str = w.substring(0, 2);
		this.hint3_str = w;
		this.played_words = [];

		//	Fill logging info
		this.expected_string = this.answer_sent;
		this.card_object = 'Sentence';
		this.card_instance = this.card.content[ci].parts.title;

		let that = this;

		//	After setting card story we have to wait before angular process playwords directive
		setTimeout(()=>{
			let d = this.psn;
			d.compileSentence();
			d.end_callback = ()=>{
				that.playSentenceFinish();
			}
		}, 20);

		
	}


	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Create formated user input string for errors log
	getUserInputString() {
		return this.user_answers;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.expected_string;
	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			this.playCorrectSound();
			this.enableNextCard();
		} else {
			this.playmedia.sound('_STNQR', function(){});
		}
	}

	updateSentenceWithHilight(sent){
		this.answer_sent = sent;
	}

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
			this.showHint();
		}
		
	}

	hide() {
		this.prevent_dubling_flag = false;
		//	Hide option buttons
		this.optionHide();
	}

	setFocus(){
		let e = this.elm.nativeElement.querySelector('.diw-input-wrap input');
		if(typeof e !== 'undefined' && e !== null){
			e.focus();
		}
	};

	//	Overload default repeat and play last uncomplete question
	repeat() {
		if(this.uinputph === 'finish'){
			this.playCorrectSound();
			this.enableNextCard();
			return;
		}
		let that = this;
		//	Check if we have RepInst instance
		if(typeof this.card.content[0].RepInst !== 'undefined' && this.card.content[0].RepInst.length > 0){
			this.lastUncomplete = this.card.content[0].RepInst[0];
			this.card.content[0].desc = this.card.content[0].RepInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.playmedia.sound(this.card.content[0].RepInst[0].audio, function(){
				that.setFocus();
				
			});
		} else {
			this.playSentenceFinish();
			this.playCardDescription();
			return;
		}
		this.playSentenceFinish(); 
		this.playContentDescription();
	}

	playSentenceFinish() {
		this.playsentence_started_flag = false;
		this.setFocus()
	}

	
	playSentence(){
		if(this.playsentence_started_flag) return; 
		this.playsentence_started_flag = true;
		let that = this;
		//$rootScope.$broadcast('rootScope:playSentenceByIndex', {ind: this.sentence_index, cb: this.playSentenceFinish});
		this.psn.playSentenceByIndex(this.sentence_index, ()=>{
			that.playSentenceFinish.call(that);
		});
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		setTimeout(function(){ that.playSentence(); }, 1000);
		
	}

	playWordAccordingToUserInput(){
		let that = this;
		let words = this.answer_sent.trim().replace(/[\.\!\?\;\,]/ig, '').split(' ');
		let uwords = this.input_data.trim().replace(/[\.\!\?\;\,]/ig, '').split(' ');
		if(uwords.length > 0 && words[uwords.length - 1] === uwords[uwords.length - 1] && 
			!this.playsentence_started_flag && 
			this.played_words.indexOf(uwords[uwords.length - 1]+(uwords.length - 1)) < 0){

			this.played_words.push(uwords[uwords.length - 1]+(uwords.length - 1));
			this.playmedia.word(uwords[uwords.length - 1].replace(/[\.\!\?\;\,]/ig, ''), function(){

				//	Reset hint level for a new word
				that.hint_1_started = false;
				that.hint_2_started = false;
				that.hint_3_started = false;
				that.hint_busy = false;
				that.current_hint_level = 0;
			}, 10);
		}

	}


	//	Setup hints for currently entered word, h1 - first letter, h2 - first 2 letters and h3 - whole word
	//	when user finish word, it will be played and all hint levels will be reset for a new word
	setupHintAccordingToUserInput(){

		let words = this.answer_sent.trim().split(' ');
		let uwords = this.input_data.trim().split(' ');
		if(uwords.length > 0 && words[uwords.length - 1] === uwords[uwords.length - 1] && !this.playsentence_started_flag){
			let i = uwords.length - 1;
			if(words.length > i+1){
				let w = words[i+1];
				this.hint1_str = w.substring(0, 1);
				this.hint2_str = w.substring(0, 2);
				this.hint3_str = w;
			}
			
		}

	}

	//	Hint 1 handler
	hintLevel1() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_1_started) return;
		this.hint_1_started = true;

		this.hint_string = this.hint1_str;
		
		//	Show word
		this.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '1';
		let that = this;
		//	Wait 3 seconds and hide
		setTimeout(function(){ 
			that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '0';
			//	Wait 400ms until transition will complete and remove it from from DOM
			setTimeout(function(){
				that.hint_busy = false; 
				that.setFocus();
			}, 400);
		}, 3000);

	}

	//	Hint 2 handler
	hintLevel2() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_2_started) return;
		this.hint_2_started = true;

		this.hint_string = this.hint2_str;
		
		//	Show word
		this.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '1';
		let that = this;
		//	Wait 3 seconds and hide
		setTimeout(function(){ 
			that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '0';
			//	Wait 400ms until transition will complete and remove it from from DOM
			setTimeout(function(){ 
				that.hint_busy = false; 
				that.setFocus();
			}, 400);
		}, 3000);
	}
	
	//	Hint 3 handler
	hintLevel3() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_3_started) return;
		this.hint_3_started = true;

		this.hint_string = this.hint3_str;
		let that = this;
		//	Show word
		this.elm.nativeElement.querySelector('.diw-hint-word').style.display = 'flex';
		setTimeout(function(){ that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '1'; }, 10);

		//	Wait 3 seconds and hide
		setTimeout(function(){ 
			that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '0';
			//	Wait 400ms until transition will complete and remove it from from DOM
			setTimeout(function(){ 
				that.hint_busy = false; 
				that.hint_3_started = false; 
				that.setFocus(); 
			}, 400);
		}, 3000);
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

	

	public lock_user_input: boolean = false;
	valueChange(inp) {
		let value = inp.currentTarget.value;
		if(this.lock_user_input) return;
		this.lock_user_input = true;
		let that = this;

		//	Define number of characters that was entered by user
		let n = value.length;

		//	Check if input data length bigger that 0
		if(n <= 0) return;

		//	Check if user complete answer
		if(this.answer_sent.toLowerCase() === value.toLowerCase()){
			//	Save errors
			this.result();
			this.playWordAccordingToUserInput();
			//	Check if needed to load next instance of the card
			if(this.current_presented < this.max_presented){
				this.playmedia.action('CHIMES', function(){
					that.current_card_instance++;
					that.setCard();
					setTimeout(function(){ that.current_presented++; that.playContentDescription(); that.lock_user_input = false; }, 300);
				}, 700);
					
			} else {
				//	Finish card
				this.uinputph = 'finish';
				this.enter();
				
			}

			return;
		}

		
		//	Define answer sunstring according to user input length
		let s = this.answer_sent.substring(0, n);

		//	Compare user input with right answer
		if(s.toLowerCase() === value.toLowerCase()){
			inp.currentTarget.value = s;
			setTimeout(()=>{ that.input_data = s; that.lock_user_input = false; }, 1);
		} else {
			//	Save for logging user mistake
			if(this.user_answers === ''){
				this.user_answers += this.input_data;
			} else {
				this.user_answers += ', ' + this.input_data;
			}

			let newval = this.answer_sent.substring(0, n - 1);
			let uval = value.substring(0, n - 1);
			while(uval !== newval && n !== 1){
				n--;
				newval = this.answer_sent.substring(0, n - 1);
			    uval = value.substring(0, n - 1);
			}
			this.input_data = inp.currentTarget.value = newval;
			setTimeout(()=>{ that.input_data = newval; that.lock_user_input = false; }, 3);
			this.playmedia.stop();
			this.playmedia.action('DING', function(){}, 30);
		}


		//	Setup hint strings for current input state
		this.setupHintAccordingToUserInput();
		this.playWordAccordingToUserInput();


	}





}