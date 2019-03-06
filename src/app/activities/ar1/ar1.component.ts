import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ar1',
  templateUrl: './ar1.component.html',
  styleUrls: ['./ar1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar1Component extends BaseComponent implements OnInit {

    constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private ar1log: LoggingService, private ar1cs: ColorschemeService) {
  		super(elm, sanitizer, playmedia, ar1log, ar1cs);
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

		//	Add card data to the directive scope
		this.card = this.data;
		
		//	Set current card header
		this.current_header = this.card.header;

		this.max_presented = this.card.content.length;


		//	User input phase
		this.uinputph = '';


		this.setCard();
	
  	}


  	//	Set header for current card
	public current_header = '';
	
	//	Initial background for user input
	public user_input_background: any;
	//	Container for right answer word parts
	public content_right_answer_word: any;
	public content_right_missing_letter: any;
	//	Flag which disable play audio of right unswer until user input right letter
	public enable_answer_play: boolean = false;
	
	//	Default hint level
	public current_hint_level = 0;
	
	public max_hint_level = 3;

	public current_card_instance = 0;
	
	public expected_string = '';

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public content = '';
	public right_answer = '';
	public result_value = 0;
	public input_data: any;
	public r: any;
	public expected: any;
	public answer_word: any;
	public hint_busy: boolean = false;

	//	User input phase
	public uinputph: any;


	setCard() {

		let ci = this.current_card_instance;
		this.expected_string = '';

		//$element.find('.card-content-body-wrap-ar2').html('');
		//$element.find('.card-content-body-btn-wrap').html('');
		this.current_hint_level = 0;

		//	Regular expression to test parts for digraph sounds
		//	/\|{1}[a-z]+\|{1}/
		
		//	Data format for AR1
		//	Student enters the missing letter for a digraph sound in a word.
		/*this.card.content = [{
			desc: 'Please enter the missing letter for a digraph sound in a word.',
			parts: ['k|n|', 'ee']
		}]*/

		//	Init input data
		this.input_data = '';

		let content = '';

		//	Digraph test regex
		let r = null;
		this.r = r = /\|{1}[A-Za-z]+\|{1}/;

		//	Add word parts to markup
		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i].replace(/\-/ig, '');

			//	Create box for digraph
			if(typeof cn !== 'undefined' && cn !== '' && r.test(cn)) {
				cn = cn.replace(r, "<input class='card-ar1-digraph-input' id='user_input' type='text' />");
				content += "<span class='card-ar2-syllable card-ar1-syllable'>"+cn+"</span>";
			}
			//	Create box for normal letters
			else if(typeof cn !== 'undefined' && cn !== '') {
				content += "<span class='card-ar2-syllable card-ar1-syllable'>"+cn+"</span>";
			}

		}

		//	Add content to page and compile it with angular compiler
		this.content = content;
		
		
		//	Add right word to markup
		content = '';
		let cn = '';
		let cnr = /\|/ig;
		let cnl = /\|/;
		this.expected = 'None';
		//	Concat all word parts and remove special vertical slashes
		for(let i in this.card.content[ci].parts){

			let c = this.card.content[ci].parts[i].replace(/\-/ig, '');;
			cn += c.replace(cnr, '');

			//	Set expected value which will be used for validation
			if(this.r.test(c)){
				let s = c.match(this.r);
				let exp = c.split('');
				let fm = false;
				for(let i in exp){
					if(!fm && exp[i] === '|'){
						this.expected_string += '(';
						fm = true;
						continue;
					}
					else if(fm && exp[i] === '|'){
						this.expected_string += ')';
						continue;
					} else {
						this.expected_string += exp[i];
					}
					
				}
				
				if(s.length > 0)
					this.expected = s[0].replace(cnr, '').toLowerCase();
				else this.expected = 'None';
			} else {
				this.expected_string += c.replace(cnr, '');
			} 

		}
		content = "<span class='card-ar2-syllable card-ar1-syllable card-ar1-right-answer content_right_answer_word'>"+cn+"</span>" +
				"<span class='card-ar2-syllable card-ar1-syllable card-ar1-right-answer content_right_missing_letter' style='display: none;'>"+this.card.content[ci].missing_letter+"</span>";
		this.answer_word = cn;


		this.card_object = 'Sound';
		this.card_instance = this.answer_word;


		//	Add content to page and compile it with angular compiler
		this.right_answer = content;

		let that = this;
		setTimeout(()=>{
			let e = that.elm.nativeElement.querySelector('#user_input');
			e.oninput = (e)=>{
				that.catchUserInput(e);
			};
			e.style.backgroundColor = 'rgb(114, 90, 63)';
			that.old_input_data = e.value;
		}, 10);

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

	//	Callback for hide card event
	hidden() {
		if(!this.isActive() && this.prevent_dubling_flag){
			this.prevent_dubling_flag = false;
			this.stopPlay();
		}
	}

	stopPlay(){
		this.playmedia.stop();
	}

	//	Validate user answer
	validate(){
		if(this.input_data !== null && this.input_data !== '')
			return this.expected === this.input_data;
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


	
	//	Set focus on empty input
	setFocus() {
		
		let inps = this.elm.nativeElement.querySelector('input[class*="card-ar1-digraph-input"]');
		if(inps !== null) inps.focus();
		
	}

	//	Blur focus on filled input and hide kb on mobile
	blurInput() {
		
		let inps = this.elm.nativeElement.querySelector('input[class*="card-ar1-digraph-input"]');
		if(inps !== null) inps.blur();
		
	}

	//	Create user answer string from combination of user input and word parts
	getAnswer() {
		let result = '';
		let r = this.r;

		//	Iterate word parts
		for(let i in this.card.content[0].parts){

			let cn = this.card.content[0].parts[i];

			//	If current word part expect user input, instead of word part add
			//	user input to result string
			if(typeof cn !== 'undefined' && cn !== '' && r.test(cn)) {
				cn = cn.replace(r, this.input_data);
				result += cn;
			}
			//	Else add word part
			else if(typeof cn !== 'undefined' && cn !== '') {
				result += cn;
			}

		}
		return result;
	}

	//	Play answer word on user click
	answerPlay() {
		//	If playing is enabled
		if(this.enable_answer_play) this.playmedia.word(this.answer_word, ()=>{});

	}
	
	//	Clear wrong inputs
	clearUserInput() {
		this.input_data = '';
		let e = this.elm.nativeElement.querySelector('#user_input');
		if(e !== null) e.value = '';
	}

	hint() {
		if(this.hint_busy) return;
		this.hint_busy = true;
		this.playmedia.stop();
		this.current_hint_level++;
		if(this.current_hint_level > this.max_hint_level) this.current_hint_level = this.max_hint_level;
		if(this.current_hint_level === 1) this.hintLevel1();
		else if(this.current_hint_level === 2) this.hintLevel2();
		else if(this.current_hint_level === 3) this.hintLevel3();
	};

	//	Hint 1 play sound of the digraph
	hintLevel1() {
		let that = this;
		//	Sound (letter) to play
		let sp = '';
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].digraph_sound;
			if(this.card.content[0].InstHint1.length > 0) {
				let fst = this.card.content[0].InstHint1[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.playmedia.sound(fst.audio, function(){});
					this.playmedia.sound(sp, function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		} 
	}

	//	Hint 2, play letters of the digraph
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
					this.playmedia.sound(fst.audio, function(){});
					for(let i in sp)
						this.playmedia.word(sp[i], function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		}
	}

	//	Hint 3, play sound, play word, play right letter
	hintLevel3() {
		let that = this;
		//	Sound (letter) to play
		let sp = '';
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].digraph_sound;
			if(this.card.content[0].InstHint3.length > 0) {
				let fst = this.card.content[0].InstHint3[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				this.elm.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block';
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.playmedia.sound(fst.audio, function(){});
					this.playmedia.sound(sp, function(){ 
							if(that.card.content[0].InstHint3.length > 1) {
								let fst = that.card.content[0].InstHint3[1];
								that.card.content[0].desc = fst.pointer_to_value;
								that.setGlobalDesc(fst.pointer_to_value);
								that.elm.nativeElement.querySelector('.content_right_answer_word').style.opacity = '1';
								
								setTimeout(function(){ 
									that.elm.nativeElement.querySelector('.content_right_answer_word').style.opacity = '0'; 
									that.elm.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block'; 
									that.elm.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '1';
									setTimeout(function(){ 
										that.elm.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block';
										that.elm.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '0';  
										setTimeout(function(){ 
											that.elm.nativeElement.querySelector('.content_right_missing_letter').style.display = 'none'; 
											that.elm.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '0';
										}, 500) 
									}, 5000); 
								}, 3000);
								if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
									that.playmedia.sound(fst.audio, function(){});
									that.playmedia.word(that.answer_word, function(){
										if(that.card.content[0].InstHint3.length > 2) {
											let fst = that.card.content[0].InstHint3[2];
											that.card.content[0].desc = fst.pointer_to_value;
											that.setGlobalDesc(fst.pointer_to_value);
											let sp = that.card.content[that.current_card_instance].missing_letter;
											if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
												that.playmedia.sound(fst.audio, function(){});
												that.playmedia.word(sp, function(){
													that.hint_busy = false; that.setFocus();
												});
											}
										}
									});
								}
							}
						});

					} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		} 
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		if(typeof this.card.content[0].LoopInst !== 'undefined' && this.card.content[0].LoopInst.length > 0){
			this.card.content[0].desc = this.card.content[0].LoopInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.playmedia.sound(this.card.content[0].LoopInst[0].audio, function(){});
			this.playmedia.word(this.answer_word, function(){ that.setFocus(); });
		}
	}

	//	Repeat instructions
	repeat() {
		if(this.uinputph === 'finish'){
			this.enter();
		} else {
			this.playContentDescription();
		}
		
	}

	enter(silent = false) {
		let that = this;
		this.playmedia.stop();
		if(!this.validate()){
			if(!silent){
				this.playmedia.sound('_STNQR', function(){ 
					 that.result(); that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; that.setFocus(); //scope.playCardDescription();
				}, 0);
			} else {
				that.result(); that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; that.setFocus(); //scope.playCardDescription();
			}
		} else {

			//	Check if we shown all card instances
			if(that.current_presented >= that.max_presented){
				if(!silent){
					this.playCorrectSound(function(){ 
						that.enableNextCard();
					});
				} else {
					that.enableNextCard();
				}
			}
		}
	}

	catchUserInput(e) {
		if(this.isActive() && typeof e !== 'undefined' && e !== null && this.old_input_data !== e.target.value){
	    	
    		//e.target.style.backgroundColor = 'white';
    		this.input_data = e.target.value;
    		if(this.input_data === "") return;
    		this.input_data = this.input_data.toLowerCase();
			this.input_data = this.input_data.split('')[0];
			
			//	Get user answer
			let result = this.input_data;

			let that = this;

			//	If user input is wrong, mark part with light coral color
			if(result !== this.expected && this.input_data !== null && this.input_data !== ''){
				e.target.style.backgroundColor = 'lightcoral';
				e.target.style.borderStyle = 'none';
			}
			//	If user input is empty, mark it with white color
			else if(result !== this.expected && (this.input_data === null || this.input_data === '')){
				e.target.style.backgroundColor = '#725A3F';
				e.target.style.borderStyle = 'none';
			} else {
			//	Else answer is right, so remove any mark colors and play answer sound
				e.target.style.backgroundColor = 'transparent';
				e.target.style.borderStyle = 'none';
				this.elm.nativeElement.querySelector('.content_right_answer_word').style.opacity = '1';
				this.elm.nativeElement.querySelector('.content_right_answer_word').style.cursor = 'pointer';

				if(this.current_presented < this.max_presented){
					this.playmedia.action('CHIMES', function(){
						that.current_card_instance++;
						that.elm.nativeElement.querySelector('.content_right_answer_word').style.opacity = '0';
						that.elm.nativeElement.querySelector('.content_right_answer_word').style.cursor = 'default';
						that.setCard();
						setTimeout(function(){ 
							that.current_presented++; 
							that.playContentDescription();
						}, 300);
					}, 300);
						
				} else {
					
					this.enable_answer_play = true;
					this.stopPlay();

					if(this.card.content[0].RespAtEnd.length > 0) {
						let fst = this.card.content[0].RespAtEnd[0];
						this.card.content[0].desc = fst.pointer_to_value;
						this.setGlobalDesc(fst.pointer_to_value);
						if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
							this.playmedia.sound(fst.audio, function(){});
							if(this.card.content[0].RespAtEnd.length === 1)
								this.playmedia.word(this.answer_word, function(){ that.enter(false); that.uinputph = 'finish'; that.blurInput(); });
							else{
								let fst = this.card.content[0].RespAtEnd[1];
								this.card.content[0].desc = fst.pointer_to_value;
								this.setGlobalDesc(fst.pointer_to_value);
								if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
									this.playmedia.sound(fst.audio, function(){});
									this.playmedia.word(this.answer_word, function(){ that.enter(false); that.uinputph = 'finish'; that.blurInput(); });
								}
							}
						}
					} else {
						this.uinputph = 'finish';
						this.enter(false);
					}
				}

			}
			
			//	Validate user input and decide enable or not next card
			if(this.validate()) this.enableMoveNext();
			else this.disableMoveNext();
	    	
	    }
	    
	}

	ngDoCheck() {
	    
	}


}