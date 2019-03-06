import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasebwComponent } from '../basebw/basebw.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-bw7',
  templateUrl: './bw7.component.html',
  styleUrls: ['./bw7.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw7Component extends BasebwComponent implements OnInit, DoCheck {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private bw7log: LoggingService, private bw7cs: ColorschemeService) {
  	super(element, sz, pms, bw7log, bw7cs);
  }

  ngOnInit() {

  	//	Set header for current card
	this.setHeader();
	this.current_number = +this.data.cross_number;
	this.card_id = this.data.id;
	this.setCardNumber();
	//this.setCardId();
	this.card = this.data;
	this.current_header = this.card.header;
	this.max_presented = this.card.content.length;

	this.setCard();

	//	User answer phases, letters, sounds and vowel sound, rec, listen, compare, finish
	this.uinputph = 'rec';

	let that = this;
	
	//	Stop recording listner
	this.recstop_event.subscribe(() => {
		if(that.isActive() && typeof that.uinputph !== 'undefined' && that.uinputph === 'rec'){
			that.uinputph = 'listen';
			setTimeout(function(){ that.playContentDescription(); }, 500);
		}
	});

	//	Start playing listner
	this.playstop_event.subscribe(() => {
		if(that.isActive() && typeof that.uinputph !== 'undefined' && that.uinputph === 'listen'){
			that.uinputph = 'compare';
			setTimeout(function(){ that.playContentDescription(); }, 500);
		}
	});

	this.old_input_data = JSON.stringify(this.input_data);

  }

    public display_answer_word: any;
    public split_letters_show: any;
    public syllables: any;
    public dashes: any;
    public split_syllables_show: any;


  	setCard() {

		this.input_data = '';

		this.answer_word = '';
		this.display_answer_word = '';

		let ci = this.current_card_instance;
		
		this.split_letters_show = false;
		this.split_syllables_show = false;
		this.split_loop_ready = false;

		let content = '';

		this.uinputph = 'rec';

		let syl = '';

		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i];
			syl += cn;
			this.answer_word += cn.replace(/\-/ig, '');

		}

		this.display_answer_word = this.answer_word;

		//	Breakdown syllables
		this.syllables = syl.split('-');
		let slbls = [];
		for(let i in this.syllables){
			let l = this.syllables[i];
			if(parseInt(i) >= this.syllables.length - 1){
				slbls.push(l);
			} else {
				slbls.push(l);
				slbls.push('-');
			}
		}
		this.syllables = slbls;

		//	Letters
		this.letters = this.answer_word.split('');
		this.dashes = [];
		let ltrs = [];
		for(let i in this.letters){
			let l = this.letters[i];
			if(parseInt(i) >= this.letters.length - 1){
				ltrs.push(l);
				this.dashes.push(0);
			} else {
				ltrs.push(l);
				ltrs.push('-');
				this.dashes.push(0);
				this.dashes.push(0);
			}
			
		}
		this.letters = ltrs;

		//	Expected result
		this.expected = '';
		for(let i in this.syllables) {
			let s = this.syllables[i];
			if(s.match(/air|ar|ear|er|ur|ir|ire|or|ore|rr|ure/ig) !== null) this.expected = s;
		}
	}

	//	Validate user answer
	validate(){
		if(this.uinputph === 'finish' || this.getSplitResult())
			return true;
		else return false;
	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				//this.playContentDescription();
				this.playCardDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.showClear();
		}
		
	}

	//	Set and reset dashes between letters
	setDash(kl){

		if(this.letters[kl] === '-' && this.dashes[kl] === 0){
			this.dashes[kl] = 1;
		}
		else if(this.letters[kl] === '-' && this.dashes[kl] === 1){
			this.dashes[kl] = 0;
		}
		

	}

	public main_description_part_played: boolean = false;

	//	Overload default play description function
	playCardDescription() {

		let that = this;
		//	Play the first instruction insequence
		const pr1 = Observable.create((observer) => {
		  
			that.lastUncomplete = that.card.content[0].instructions[0];
			let i = that.card.content[0].instructions[0];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.pms.sound(i.audio, function(){
    				observer.next(0); observer.complete();
    				that.setFocus();
    			});
    		}
    		that.main_description_part_played = true;
		    
		});
		
		pr1.subscribe((finalResult) => {
		  	that.playContentDescription();
		});
		
	}

	//	Overload default repeat and play last uncomplete question
	repeat() {
		let that = this;
		if(this.uinputph === 'split') this.splitLoop();
		//	When we are in syllable help phase (student splited the word incorrect), incorrect instruction must be played
		else if(this.uinputph === 'sylhelp'){
			if(this.card.content[0].RespIfIncorrect2.length > 1){
				this.lastUncomplete = this.card.content[0].RespIfIncorrect2[0];
				let i = this.card.content[0].RespIfIncorrect2[0];
				this.card.content[0].desc = i.pointer_to_value;
				this.setGlobalDesc(this.card.content[0].desc);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			this.pms.sound(i.audio, function(){
	    				
	    				that.lastUncomplete = that.card.content[0].RespIfIncorrect2[1];
						let i = that.card.content[0].RespIfIncorrect2[1];
						that.card.content[0].desc = i.pointer_to_value;
						that.setGlobalDesc(that.card.content[0].desc);
			    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
			    			that.pms.sound(i.audio, function(){
			    				that.uinputph = 'sylhelp';
			    				that.blinkEnter();
			    			});
	    				}
	    				
	    				
	    			});
	    		} else  setTimeout(function(){
	    			that.uinputph = 'sylhelp';
	    			that.blinkEnter();
	    		}, 1);
	    	} else setTimeout(function(){
	    		that.uinputph = 'sylhelp';
	    		that.blinkEnter();
	    	}, 1);
		}
		else this.playContentDescription();
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {

		let that = this;
		let del = 400;
		//	Phase 4 rec instructions, if mic is enabled
		if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkRec();
			this.pms.sound(this.card.content[0].RecInst[0].audio, function(){});
			this.pms.word(this.answer_word, function(){});
		}
		//	Phase 4 rec instructions, if mic is disabled
		if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.uinputph = 'split';
			this.split_letters_show = true;
			setTimeout(function(){ this.splitLoop(); }, del*2);
		}
		//	Phase 5 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkPlay();
			this.pms.sound(this.card.content[0].PlayInst[0].audio, function(){});
		}
		//	Phase 6 compare instructions
		else if(typeof this.card.content[0].CompInst !== 'undefined' && this.card.content[0].CompInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].CompInst[0];
			this.card.content[0].desc = this.card.content[0].CompInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkWord();
			this.pms.sound(this.card.content[0].CompInst[0].audio, function(){});
		}

	}

	//	Phase incorrect message
	respIfIncorrect() {
		
		let that = this;

		//	Play the first part
		const pr1 = Observable.create((observer) => {

			that.lastUncomplete = that.card.content[0].RespIfIncorrect1[0];
			let i = that.card.content[0].RespIfIncorrect1[0];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.pms.sound(i.audio, function(){
    				
    				that.lastUncomplete = that.card.content[0].RespIfIncorrect1[1];
					let i = that.card.content[0].RespIfIncorrect1[1];
					that.card.content[0].desc = i.pointer_to_value;
					that.setGlobalDesc(i.pointer_to_value);
					if(typeof i.audio !== 'undefined' && i.audio !== ''){
    					that.pms.sound(i.audio, function(){});
    					that.pms.word(that.answer_word, function(){
    						observer.next(0); observer.complete();
    						that.setFocus();
    					});
    				}
    			});
    		} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		  
		});
		
		pr1.subscribe((finalResult) => {
		  	
			//	Show right answer
			that.split_syllables_show = true;
			
			if(that.card.content[0].RespIfIncorrect2.length > 1){
				that.lastUncomplete = that.card.content[0].RespIfIncorrect2[0];
				let i = that.card.content[0].RespIfIncorrect2[0];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.pms.sound(i.audio, function(){
	    				
	    				that.lastUncomplete = that.card.content[0].RespIfIncorrect2[1];
						let i = that.card.content[0].RespIfIncorrect2[1];
						that.card.content[0].desc = i.pointer_to_value;
						that.setGlobalDesc(i.pointer_to_value);
			    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
			    			that.pms.sound(i.audio, function(){
			    				that.uinputph = 'sylhelp';
			    				that.blinkEnter();
			    				
			    			});
	    				}
	    				
	    				
	    			});
	    		} else  setTimeout(function(){
	    			that.uinputph = 'sylhelp';
	    			that.blinkEnter(); 
	    		}, 1);
	    	} else setTimeout(function(){
	    		that.uinputph = 'sylhelp';
	    		that.blinkEnter();
	    	}, 1);

		});

	}

	//	Reset user input
	clearUserInput() {
		if(this.uinputph === 'finish') return;
		for(let i in this.dashes)
			this.dashes[i] = 0;
		
	}
	
	clear() {
		this.clearUserInput();
	}

	public play_word_busy_flag: boolean = false;

	playWord(){

		if(this.play_word_busy_flag) return;
		this.play_word_busy_flag = true;
		let that = this;
		let hletter = 0;
		let pr = this.card.content[this.current_card_instance].parts;

		//	Play word
		this.pms.word(this.answer_word, function(){
			//	Start hilight letters when word play will complete
			that.display_answer_word = that.hilightWordLetter(pr, hletter);
			
		});

		//	Play pronuncuation of the word
		if(typeof this.card.content[this.current_card_instance].pronounce !== 'undefined' && this.card.content[this.current_card_instance].pronounce.length > 0){

			//	Delay before play each sound
			let del = 400;

			for(let i in this.card.content[this.current_card_instance].pronounce) {
				let p = '_S' + this.card.content[this.current_card_instance].pronounce[i]; p = p.replace('-', '');

				//	Check if we play the last sound, switch user input phase to next and play next instructions
				if(parseInt(i) === this.card.content[this.current_card_instance].pronounce.length - 1){
					this.pms.sound(p, function(){
						if(that.uinputph === 'compare'){
							that.uinputph = 'split';
							that.split_letters_show = true;
							setTimeout(function(){ that.splitLoop(); }, del*2);
						}
						that.play_word_busy_flag = false;
						that.display_answer_word = that.answer_word;
						
					}, del);
				} else {
					this.pms.sound(p, function(){
						//	Continue hilight letters according to prponuncuation
						hletter++;
						that.display_answer_word = that.hilightWordLetter(pr, hletter);
						
					}, del);
				}
			}
		}
	}
	
	isDashesSetted(){
		for(let i in this.dashes){
			if(this.dashes[i] === 1){
				return true;
			}
		}
		return false;
	}
	
	getSplitResult() {
		
		//	Expected
		let expected = '';
		for(let i in this.syllables)
			expected += this.syllables[i];
		 
		//	User input
		let uinp = '';
		for(let i in this.letters){
			let l = this.letters[i];
			if(l === '-'){
				if(this.dashes[i] === 1){
					uinp += '-';
				}
			} else {
				uinp += l;
			}
		}

		//	Fill data for user errors logging
		this.expected_string = expected.toLowerCase();
		this.input_data = uinp.toLowerCase();
		
		return expected.toLowerCase() === uinp.toLowerCase();
		
	}
	
	//	Enter click handler
	//	Overload of default function, wait when user split the word to syllables and play response correct or not
	enter() {
		let that = this;
		
		if(this.uinputph === 'split' && this.isDashesSetted() && this.split_loop_ready){
			
			//	Check result
			if(this.getSplitResult()){
				//this.uinputph = 'finish';

				this.finishOrContinueBW();

				//	Show right answer
				this.split_syllables_show = true;
			
				that.playCorrectSound(function(){
					//this.enableNextCard();
				});
			} else {

				//	Log user error
				this.card_object = 'Word';
				this.card_instance = this.expected_string;
				this.result();

				this.respIfIncorrect();
				
			}
			return;
		}
		else if(this.uinputph === 'finish'){
			this.enableNextCard();
		}
		else if(this.uinputph === 'sylhelp'){
			this.finishOrContinueBW();
		}

	}
	
	public split_loop_ready: boolean = false;
	splitLoop() {

		let that = this;

		//	Play the first loop instruction in sequence
		const pr1 = Observable.create((observer) => {

			that.lastUncomplete = that.card.content[0].LoopInst[0];
			let i = that.card.content[0].LoopInst[0];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.pms.sound(i.audio, function(){
    				observer.next(0); observer.complete();
    				that.setFocus();
    			});
    		} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		    
		})
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].LoopInst.length > 1){
				that.lastUncomplete = that.card.content[0].LoopInst[1];
				let i = that.card.content[0].LoopInst[1];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.pms.sound(i.audio, function(){
	    				observer.next(0); observer.complete();
	    			});
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		  });
		}))
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].LoopInst.length > 2){
				that.lastUncomplete = that.card.content[0].LoopInst[2];
				let i = that.card.content[0].LoopInst[2];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.pms.sound(i.audio, function(){
	    				observer.next(0); observer.complete();
	    			});
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		  });
		}));
		
		pr1.subscribe((finalResult) => {
			that.split_loop_ready = true;
		});


	}
	
	playRule(){
		if(this.uinputph !== 'finish' && this.uinputph !== 'sylhelp') return;
		let descs = [];
		let di = 0;
		let that = this;
		for(let i in this.card.content[0].Rule1){
			let r = this.card.content[0].Rule1[i];
			descs.push(r.pointer_to_value);
			this.pms.sound(r.audio, function(){
				di++;
				that.card.content[0].desc = descs[di];
				that.setGlobalDesc(that.card.content[0].desc);
			});
		}
		this.card.content[0].desc = descs[di];
		that.setGlobalDesc(that.card.content[0].desc);
	}

	setFocus(){}

	//	Watch if user type any data
	ngDoCheck() {}

}