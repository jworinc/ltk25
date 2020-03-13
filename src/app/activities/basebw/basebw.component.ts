import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-basebw',
  templateUrl: './basebw.component.html',
  styleUrls: ['./basebw.component.scss']
})
export class BasebwComponent extends BaseComponent implements OnInit, DoCheck {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private bbwlog: LoggingService, private bbwcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, bbwlog, bbwcs);

  }

  ngOnInit() {}

  	//	Set header for current card
	public current_header = '';
	
	//	Default hint level
	public current_hint_level = 0;	
	public max_hint_level = 3;
	public current_card_instance = 0;
	public expected_string = '';

	public input_data: any = '';
	public answer_word: any;
	public uinputph: any;
	public main_description_part_played: boolean = false;
	public play_pronouce_busy_flag: boolean = false;
	public letters: any;
	public expected: any;
	public vovels: any;
	public old_input_data: any;
	public card_object: any;
	public card_instance: any;
					

	setCard() {
		
		this.current_hint_level = 0;
		let ci = this.current_card_instance;
		
		this.input_data = '';
		this.answer_word = '';
		let content = '';
		this.elm.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '0';
		this.uinputph = 'letters';
		this.main_description_part_played = false;
		this.letters = [];
		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i];
			this.answer_word += cn.replace(/\-/ig, '');
			this.letters.push(cn.replace(/\-/ig, ''));
		}

		//	Get letters of the word
		//this.letters = this.answer_word.split('');

		//	Expected number of letters
		this.expected = this.answer_word.split('').length;
		this.mselshow = true;
		this.mseltype = 'numbers';
		if(typeof (this as any).msel !== 'undefined') (this as any).msel.update();
	}

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public card: any;
	public max_presented = 0;
	



	contentPlay(p) {
		this.playmedia.word(p, function(){});
	}

	syllablePlay(p) {
		this.playmedia.sound(p, function(){});
	}

	stopPlay(){
		this.playmedia.stop();
	}; 

	//	Here is user answer
	public result_value = 0;

	//	Validate user answer
	validate(){
		if(this.uinputph === 'finish')
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


	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag: boolean = false;

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){

			this.playmedia.stop();

			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				this.playContentDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.play_pronouce_busy_flag = false;
			this.input_data = '';
			if(this.uinputph === 'vowel' || this.uinputph === 'rec' || this.uinputph === 'listen' || this.uinputph === 'compare')
				this.elm.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '1';
			else this.elm.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '0';
			//this.mselshow = true;
			if(typeof (this as any).msel !== 'undefined') (this as any).msel.update();
		}
		
		
	}

	//	Overload default play description function
	playCardDescription() {

		if(this.main_description_part_played){
			this.playContentDescription();
			return;
		}

		let that = this;
		//	Play the first instruction insequence
		const pr1 = Observable.create((observer) => {
		  
			that.lastUncomplete = that.card.content[0].instructions[0];
			let i = that.card.content[0].instructions[0];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
			if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.playmedia.sound(i.audio, function(){
    				observer.next(0); observer.complete();
    			});
    			
    		} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
    		that.main_description_part_played = true;
		    
		})
		//	Play second instruction with required word
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		  	that.elm.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '1';
		    if(that.card.content[0].instructions.length > 1){
				that.lastUncomplete = that.card.content[0].instructions[1];
				let i = that.card.content[0].instructions[1];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){});
	    			that.playmedia.word(that.answer_word, function(){
	    				observer.next(0); observer.complete();
	    			});
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else {
	    		setTimeout(function(){
	    			that.playmedia.word(that.answer_word, function(){
	    				observer.next(0); observer.complete(); 
	    			}); 
	    			
	    		}, 100);
	    	}

		  });
		}));

		//	Play third part instruction with required word
		pr1.subscribe((finalResult) => {
		  	if(that.card.content[0].instructions.length > 2){
				that.lastUncomplete = that.card.content[0].instructions[2];
				let i = that.card.content[0].instructions[2];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){}, 300);
	    			that.playmedia.word(that.answer_word, function(){
	    				setTimeout(function(){ that.playContentDescription(); }, 1000);
	    			}, 1);
	    		} else  setTimeout(function(){ that.playContentDescription(); }, 1);
	    	} else setTimeout(function(){ that.playContentDescription(); }, 1);


		});


	}

	//	Overload default repeat and play last uncomplete question
	
	repeat() {
		this.playContentDescription();
	}

	finishOrContinueBW(cb = ()=>{}) {
		let that = this;
		if(this.current_presented < this.max_presented){
			this.playmedia.action('CHIMES', function(){
				that.current_card_instance++;
				that.setCard();
				setTimeout(function(){
					that.current_presented++; 
					that.playContentDescription();
					that.disableMoveNext();
					if(typeof cb !== 'undefined') cb();
				}, 300);
			}, 300);
				
		} else {
			this.uinputph = 'finish';
			this.enableMoveNext();
			this.enter();
		}
	}
	
	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		//	Phase 1 how many letters
		if(typeof this.card.content[0].Question1 !== 'undefined' && this.card.content[0].Question1.length > 0 && this.uinputph === 'letters'){
			this.lastUncomplete = this.card.content[0].Question1[0];
			this.card.content[0].desc = this.card.content[0].Question1[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question1[0].pointer_to_value);
			this.playmedia.sound(this.card.content[0].Question1[0].audio, function(){
				that.setFocus();
				that.input_data = '';
			});
		} 
		//	Phase 2 how many sounds
		else if(typeof this.card.content[0].Question2 !== 'undefined' && this.card.content[0].Question2.length > 0 && this.uinputph === 'sounds'){
			this.lastUncomplete = this.card.content[0].Question2[0];
			this.card.content[0].desc = this.card.content[0].Question2[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question2[0].pointer_to_value);
			this.playmedia.sound(this.card.content[0].Question2[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
		}
		//	Phase 3 vowel sound
		else if(typeof this.card.content[0].Question3 !== 'undefined' && this.card.content[0].Question3.length > 0 && this.uinputph === 'vowel'){
			this.lastUncomplete = this.card.content[0].Question3[0];
			this.card.content[0].desc = this.card.content[0].Question3[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question3[0].pointer_to_value);
			this.playmedia.sound(this.card.content[0].Question3[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
			this.playmedia.word(this.answer_word, function(){});
		}
		//	Phase 4 rec instructions, if mic is enabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].RecInst[0].pointer_to_value);
			this.blinkRec();
			this.playmedia.sound(this.card.content[0].RecInst[0].audio, function(){
				that.card.content[0].desc = that.card.content[0].RecInst[1].pointer_to_value;
				that.setGlobalDesc(that.card.content[0].RecInst[1].pointer_to_value);
				that.playmedia.sound(that.card.content[0].RecInst[1].audio, function(){});
				that.playmedia.word(that.answer_word, function(){});
			});
		}
		//	Phase 4 rec instructions, if mic is disabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.finishOrContinueBW();
		}
		//	Phase 5 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].PlayInst[0].pointer_to_value);
			this.blinkPlay();
			this.playmedia.sound(this.card.content[0].PlayInst[0].audio, function(){});
		}
		//	Phase 6 compare instructions
		else if(typeof this.card.content[0].NextInst !== 'undefined' && this.card.content[0].NextInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].NextInst[0];
			this.card.content[0].desc = this.card.content[0].NextInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].NextInst[0].pointer_to_value);
			this.blinkWord();
			this.playmedia.sound(this.card.content[0].NextInst[0].audio, function(){});
		}
	}

	//	Number of wrong user enters of letters, sounds, vowels
	public wrong_letters = 0;
	public wrong_sounds = 0;
	public wrong_vowels = 0;

	//	Phase incorrect message
	respIfIncorrect() {
		
		let digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
		let that = this;
		if(this.uinputph === 'letters'){
			this.card.content[0].desc = this.card.content["0"]["RespIf Incorrect1"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content["0"]["RespIf Incorrect1"][0].pointer_to_value);
			this.playmedia.sound(this.card.content["0"]["RespIf Incorrect1"][0].audio, function(){
				if(that.wrong_letters > 0){
					that.card.content[0].desc = that.card.content["0"]["RespIf Incorrect1"][1].pointer_to_value;
					that.setGlobalDesc(that.card.content["0"]["RespIf Incorrect1"][1].pointer_to_value);
					that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '1';
					setTimeout(function(){ that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; }, 3000);
				} else {
					 that.clearUserInput(); that.setFocus();
					 that.wrong_letters++;
				}
			});
			if(this.wrong_letters > 0){
				this.playmedia.sound(this.card.content["0"]["RespIf Incorrect1"][1].audio, function(){});
				this.playmedia.word(digits[this.expected - 1], function(){ that.clearUserInput(); that.setFocus(); that.wrong_letters++; that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; });
			}

		}
		else if(this.uinputph === 'sounds'){
			this.card.content[0].desc = this.card.content["0"]["RespIf Incorrect2"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content["0"]["RespIf Incorrect2"][0].pointer_to_value);
			this.playmedia.sound(this.card.content["0"]["RespIf Incorrect2"][0].audio, function(){
				if(that.wrong_sounds > 0){
					that.card.content[0].desc = that.card.content["0"]["RespIf Incorrect2"][1].pointer_to_value;
					that.setGlobalDesc(that.card.content["0"]["RespIf Incorrect2"][1].pointer_to_value);
					that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '1';
					setTimeout(function(){ that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; }, 3000);
				} else {
					that.clearUserInput(); that.setFocus();
					that.wrong_sounds++;
				}
			});
			if(this.wrong_sounds > 0){
				this.playmedia.sound(this.card.content["0"]["RespIf Incorrect2"][1].audio, function(){});
				this.playmedia.word(digits[this.expected - 1], function(){ that.clearUserInput(); that.setFocus(); that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; });
			}
		}
		else if(this.uinputph === 'vowel'){
			this.card.content[0].desc = this.card.content["0"]["RespIf Incorrect3"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content["0"]["RespIf Incorrect3"][0].pointer_to_value);
			this.playmedia.sound(this.card.content["0"]["RespIf Incorrect3"][0].audio, function(){
				if(that.wrong_vowels > 0){
					that.card.content[0].desc = that.card.content["0"]["RespIf Incorrect3"][1].pointer_to_value;
					that.setGlobalDesc(that.card.content["0"]["RespIf Incorrect3"][1].pointer_to_value);
					that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '1';
					setTimeout(function(){ that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; }, 3000);
				} else {
					that.clearUserInput(); that.setFocus();
					that.wrong_vowels++;
				}
			});
			if(this.wrong_vowels > 0){
				this.playmedia.sound(this.card.content["0"]["RespIf Incorrect3"][1].audio, function(){});
				this.playmedia.word(this.expected, function(){ 
					that.clearUserInput(); 
					that.setFocus(); 
					that.elm.nativeElement.querySelector('.bw1-expected-enter').style.opacity = '0'; 
				});
			}
		}
		
	}

	//	Reset user input
	clearUserInput() {
		this.input_data = '';	
	}
	
	setFocus() {
		this.elm.nativeElement.querySelector('.bw1-user-input input').focus();
	}

	hint() {
		
	}

	getVowel() {
		let out;
		this.vovels = ['a', 'e', 'i', 'o', 'u', 'y'];
		for(let i in this.letters){
			let p = this.letters[i];
			if(p.length > 1) p = p.split("")[0];
			if(this.vovels.indexOf(p.toLowerCase()) >= 0){ 
				out = p; 
				break; 
			}
		}
		return out;
	}

	playWord(){
		let that = this;
		this.playmedia.stop();
		this.play_pronouce_busy_flag = false;
		this.playmedia.word(this.answer_word, function(){
			if(that.uinputph === 'compare'){
				that.playPronounce(function(){
					that.finishOrContinueBW();
					
				});
				
			}
		});
	}

	
	playPronounce(cb = ()=>{}){
		
		if(this.play_pronouce_busy_flag) return;
		this.play_pronouce_busy_flag = true;

		let callback = cb;
		let that = this;
		let ci = this.current_card_instance;
		//	Play pronuncuation of the word
		if(typeof this.card.content[ci].pronounce !== 'undefined' && this.card.content[ci].pronounce.length > 0){

			//	Delay before play each sound
			let del = 400;
			let ml = 0;
			let prnc = this.card.content[ci].pronounce;
			let pm_immidiate_stop = this.playmedia.immidiate_stop_event.subscribe(()=>{
				pm_immidiate_stop.unsubscribe();
				that.play_pronouce_busy_flag = false;
				that.elm.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#C69C6D';
				that.clearUserInput();
			})
			this.elm.nativeElement.querySelector('.bw1-letter').style.backgroundColor = '#C69C6D';
			this.elm.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#00ADEF';
			for(let i in prnc) {
				let p = '_S' + prnc[i]; p = p.replace('-', '');
				//	Check if we play the last sound, switch user input phase to next and play next instructions
				if(parseInt(i) === prnc.length - 1){
					this.playmedia.sound(p, function(){
						if(typeof callback !== 'undefined') setTimeout(function(){ callback(); }, del*2);
						that.play_pronouce_busy_flag = false;
						that.elm.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#C69C6D';
						pm_immidiate_stop.unsubscribe();
					}, del);
				} else {
					this.playmedia.sound(p, function(){
						ml++;
						that.elm.nativeElement.querySelector('.bw1-letter[data-index="'+(ml-1)+'"]').style.backgroundColor = '#C69C6D';
						that.elm.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#00ADEF';
						
					}, del);
				}
			}
		}
	}
	
	askNumSounds() {
		let that = this;
		this.playPronounce(function(){
			that.uinputph = 'sounds';
			that.expected = +that.card.content[that.current_card_instance].sounds;
			that.playContentDescription();
			if(typeof (that as any).msel !== 'undefined') (that as any).msel.update();
		});
	}

	//	Hilight letters in the word according to pronuncuation
	hilightWordLetter(source, letter){
		let before = '';
		let target = '';
		let after = '';
		//var ltrs = source.split('');
		let ltrs = source;
		for(let i in ltrs){
			let l = ltrs[i].replace(/\-/ig, '');
			if(parseInt(i) < letter){
				before += l;
			}
			else if(parseInt(i) === letter){
				target += l;
			}
			else if(parseInt(i) > letter){
				after += l;
			}
		}
		return before + '<span class="hilight-pronounce-letter">' + target + '</span>' + after;
	}

	ngDoCheck() {}

	enter() {
		if((this.uinputph === 'letters' || this.uinputph === 'sounds' || this.uinputph === 'vowel') && this.input_data === '') {
			this.playmedia.stop();
			this.repeat();
			return;
		}
		//else if((this.uinputph === 'letters' || this.uinputph === 'sounds' || this.uinputph === 'vowel') && this.input_data !== ''){
		//	this.valueChange(null);
		//	return;
		//}
		//	Check if we shown all card instances
		let that = this;
		if(this.uinputph === 'finish' && this.current_presented >= this.max_presented){
			this.playmedia.stop();
			if(this.getUserInputString() !== ''){
				this.playCorrectSound(function(){ 
					that.enableNextCard();
					that.moveNext();
				});
			} else {
				that.enableNextCard();
				that.moveNext();
			}
		}
	}

	//	Watch if user type any data
	//ngDoCheck() {
	valueChange($event){
		if(!this.isActive()) return;
		//console.log('bw onchange');
	    //const change = this.differ.diff(this.input_data);
	    //if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){
		if(this.isActive()) {
	    	//this.old_input_data = JSON.stringify(this.input_data);

				let that = this;
				
				this.playmedia.stop();
				this.play_pronouce_busy_flag = false;

			//	When current phase is letters, check if num letters match with user input and switch to next
			if(this.uinputph === 'letters' && this.input_data !== ''){
				if(this.input_data == this.expected){
					this.askNumSounds();
					return;
				} else {
					//	Log user error
					this.card_object = 'Question';
					this.card_instance = this.expected_string = 'How Many Letters? ' + this.answer_word + ' ('+this.expected+')';
					this.result();
					this.respIfIncorrect();
				}
			}
			//	Check if user input correct number of sounds
			if(this.uinputph === 'sounds' && this.input_data !== ''){
				if(this.input_data == this.expected){
					this.uinputph = 'vowel';
					this.expected = this.getVowel();
					this.input_data = '';
					this.mselshow = false;
					//if(typeof (this as any).msel !== 'undefined') (this as any).msel.update();
					this.playCardDescription();
					return;
				} else {
					//	Log user error
					this.card_object = 'Question';
					this.card_instance = this.expected_string = 'How Many Sounds? ' + this.answer_word + ' ('+this.expected+')';
					this.result();
					this.respIfIncorrect();
				}
			}
			//	Check if user input correct vowel sound
			if(this.uinputph === 'vowel' && this.input_data !== ''){
				if(this.input_data.toLowerCase() === this.expected){
					this.uinputph = 'rec';
					this.playContentDescription();
					return;
				} else {
					//	Log user error
					this.card_object = 'Question';
					this.card_instance = this.expected_string = 'What Is The Vowel? ' + this.answer_word + ' ('+this.expected+')';
					this.result();
					this.respIfIncorrect();
				}
			}
			//	Validate user input and decide enable or not next card
			if(this.validate()){
				
				this.finishOrContinueBW();

			}
			else this.disableMoveNext();

	  }
	    
	}

	
	handleUserInput($event) {
		this.input_data = $event;
		this.valueChange({});
	}
	


}
