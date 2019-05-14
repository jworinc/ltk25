import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-diw',
  templateUrl: './diw.component.html',
  styleUrls: ['./diw.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class DiwComponent extends BaseComponent implements OnInit, DoCheck {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private diwlog: LoggingService, private diwcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, diwlog, diwcs);
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

	this.old_input_data = JSON.stringify(this.input_data);
  }

  	//	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_hint_level = 0;

	public max_hint_level = 3;

	public current_card_instance = 0;
	
	public expected_string = '';

	public answer_word = '';

	public user_answers = '';

	public letters = [];

	public input_data: any = '';

	public hint_1_started: boolean = false;
	public hint_2_started: boolean = false;
	public hint_3_started: boolean = false;
	public hint_busy: boolean = false;

	//	Define current card number
	public current_number = 0;
	public card_id = 0;

	//	There is an issue with auto correction, when it performs, watcher runs user input handler cycle again
	//	and we have unnessesary step which led to doublings in mistakes log, to prevent it used flag below
	public skip_next_step: boolean = false;
	
	setCard() {

		let ci = this.current_card_instance;

		this.input_data = '';

		this.letters = this.card.content[ci].parts;

		this.answer_word = '';

		this.user_answers = '';
		
		//	Create list of word/image content of the card
		let content = '';
		for(let i = 0; i < this.card.content[ci].parts.length; i++) {

			//	Get current list item
			let c = this.card.content[ci].parts[i];
			this.answer_word += c;

		}

		//	Fill logging info
		this.expected_string = this.answer_word;
		this.card_object = 'Word';
		this.card_instance = this.answer_word;
		
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

	prehide() {
		if(this.uinputph !== 'finish')
			this.result();
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
		let scope = this;
		//	Check if we have RepInst instance
		if(typeof this.card.content[0].RepInst !== 'undefined' && this.card.content[0].RepInst.length > 0){
			this.lastUncomplete = this.card.content[0].RepInst[0];
			this.card.content[0].desc = this.card.content[0].RepInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.playmedia.sound(this.card.content[0].RepInst[0].audio, function(){
				scope.setFocus();
				
			});
		} 
		this.playContentDescription();
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {

		this.playmedia.word(this.answer_word, function(){}, 300);
		
	}

	//	Hint 1 handler
	hintLevel1() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_1_started) return;
		this.hint_1_started = true;
		let that = this;
		//	Show word
		this.elm.nativeElement.querySelector('.diw-hint-word').style.display = 'flex';
		setTimeout(function(){ that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '1'; }, 10);

		//	Wait 3 seconds and hide
		setTimeout(function(){ 
			that.elm.nativeElement.querySelector('.diw-hint-word').style.opacity = '0';
			//	Wait 400ms until transition will complete and remove it from from DOM
			setTimeout(function(){ that.elm.nativeElement.querySelector('.diw-hint-word').style.display = 'none'; that.hint_busy = false; that.setFocus(); }, 400);
		}, 3000);

	}

	//	Hint 2 handler
	hintLevel2() {
		let that = this;
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_2_started) return;
		this.hint_2_started = true;

		//	Play letters of the word

		let letters_pull = [];
		function setHintLeterDesc(){
			that.card.content[0].desc = letters_pull.shift();
			that.setGlobalDesc(that.card.content[0].desc);

		}
		for(let i in this.letters){
			let l = this.letters[i];
			letters_pull.push(l);
			//	Check if this is a last letter, clear hint busy flag
			if(parseInt(i) === this.letters.length - 1){
				this.playmedia.sound('_S'+l, function(){
    				setHintLeterDesc();
    				that.hint_busy = false;
    				that.setFocus();
    				
    			}, 300);
			} else {
				this.playmedia.sound('_S'+l, function(){
    				setHintLeterDesc();
    			}, 300);
			}

		}
		setHintLeterDesc();

	}
	
	//	Hint 3 handler
	hintLevel3() {
		//	Check if hint 1 or hint 3 is already started, then return
		if(this.hint_3_started) return;
		this.hint_3_started = true;
		let that = this;
		//	Show letters
		this.elm.nativeElement.querySelector('.diw-hint-letters-show').style.display = 'flex';
		setTimeout(function(){ that.elm.nativeElement.querySelector('.diw-hint-letters-show').style.opacity = '1'; }, 10);
		
		//	Play letters of the word

		let letters_pull = [];
		//	Get current background
		let bg = this.elm.nativeElement.querySelector('.diw-hint-letters-show span').style.backgroundColor;
		function setHintLeterDesc(){
			that.card.content[0].desc = letters_pull.shift();
			that.setGlobalDesc(that.card.content[0].desc);

			let i = letters_pull.length + 1;
			i = that.letters.length - i;
			that.elm.nativeElement.querySelectorAll('.diw-hint-letters-show span').forEach((e)=>{
				e.style.backgroundColor = bg;
			});
			
			that.elm.nativeElement.querySelector('.diw-hint-letters-show span[data-index="'+i+'"]').style.backgroundColor = 'yellow';

		}
		for(let i in this.letters){
			let l = this.letters[i];
			letters_pull.push(l);
			//	Check if this is a last letter, clear hint busy flag
			if(parseInt(i) === this.letters.length - 1){
				this.playmedia.sound('_S'+l, function(){
    				setHintLeterDesc();
    				that.hint_busy = false;
    				that.hint_3_started = false;
    				that.setFocus();
    				that.elm.nativeElement.querySelectorAll('.diw-hint-letters-show').forEach((e)=>{
    					e.style.opacity = '0';
    				});
    				that.elm.nativeElement.querySelectorAll('.diw-hint-letters-show span').forEach((e)=>{
						e.style.backgroundColor = bg;
					});
	    			//	Wait 400ms until transition will complete and remove it from from DOM
	    			setTimeout(function(){ 
	    				that.elm.nativeElement.querySelectorAll('.diw-hint-letters-show').forEach((e)=>{
	    					e.style.display = 'none';
	    				});
    				}, 400);
    			}, 300);
			} else {
				this.playmedia.sound('_S'+l, function(){
    				setHintLeterDesc();
    			}, 300);
			}

		}
		setHintLeterDesc();

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
		if(this.answer_word.toLowerCase() === value.toLowerCase()){
			//	Save errors
			this.result();
			//	Check if needed to load next instance of the card
			if(this.current_presented < this.max_presented){
				this.playmedia.action('CHIMES', function(){
					that.current_card_instance++;
					that.setCard();
					setTimeout(function(){ that.current_presented++; that.playContentDescription();  that.lock_user_input = false; }, 300);
				}, 300);
					
			} else {
				//	Finish card
				this.uinputph = 'finish';
				this.enter();
				
			}
			
			return;
		}

		
		//	Define answer sunstring according to user input length
		let s = this.answer_word.substring(0, n);

		//	Compare user input with right answer
		if(s.toLowerCase() === value.toLowerCase()){
			//this.input_data = s;
			inp.currentTarget.value = s;
			setTimeout(()=>{ that.input_data = s; that.lock_user_input = false; }, 1);
		} else {
			//	Save for logging user mistake
			if(this.user_answers === ''){
				this.user_answers += value;
			} else {
				this.user_answers += ', ' + value;
			}

			let newval = this.answer_word.substring(0, n - 1);
			let uval = value.substring(0, n - 1);
			while(uval !== newval && n !== 1){
				n--;
				newval = this.answer_word.substring(0, n - 1);
			    uval = value.substring(0, n - 1);
			}
			this.input_data = inp.currentTarget.value = newval;
			setTimeout(()=>{ that.input_data = newval; that.lock_user_input = false; }, 3);
			//this.skip_next_step = true;
			this.playmedia.stop();
			this.playmedia.action('DING', function(){}, 30);
		}


	}


	ngDoCheck() {

	}

	
	

}