import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class CarComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private carlog: LoggingService, private carcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, carlog, carcs);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
		//this.setCardId();
		this.card = this.data;

		this.current_header = this.card.header;

		//	Create list of word/image content of the card
		let content = '';
		for(let i = 0; i < this.data.content.length; i++) {

			//	Get current list item
			let c = this.data.content[i];

			//	Parse the word
			//	Word consists of normall letters and highlighted letters
			//	normall letters simply stored as array items
			//	highlighted letters wrapped in '|a|' construction
			//	word array example ['s', '|a|', 'fe']
			//	second element in array is highlighted
			let word = '';
			for(let j = 0; j < c.word.length; j++) {
				let w = c.word[j];
				let hc = typeof c.highlightcolor !== 'undefined' ? c.highlightcolor : '#000000';
				if(/\|*\|/.test(w)){
					let sw = w.substr(1, w.length - 2);
					c.word_letters = this.word_letters = sw;
					this.answer_word += sw;
					word += "<span class='card-content-intensified-t1' style='color: "+hc+"; text-shadow: 0 0 3px "+hc+";'>"+sw+"</span>";
				} else {
					word += w;
					this.answer_word += w;
				}
			}

			c.word_parsed = word;
			c.wcstyles={
				'color': c.wordcolor,
				'text-shadow': '0 0 3px ' + c.wordcolor
			}

			//	Redirect path of images to single media source ltk.cards
					if(typeof c.img !== 'undefined' && c.img !== '' && !/^http/i.test(c.img)){
							c.img = this.sp.mediastorage + c.img;
					}


		}

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

		//	Good button press event
		this.good_btn.subscribe(()=>{
			that.good();
		});

		//	Bad button press event
		this.bad_btn.subscribe(()=>{
			that.bad();
		});

  }


    //	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'start';

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	public card: any;
	
	public word_letters = '';

	public answer_word = '';

	public blinkletter: boolean = false;
	

	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Enter click handler
	enter(silent) {
		let sl = silent || false;
		if(this.uinputph === 'finish'){
			if(!sl && this.getUserInputString() !== '') this.playCorrectSound(()=>{});
			this.enableNextCard();
		}
	}

	//	Good button click
	good() {
		if(this.uinputph === 'question'){
			this.uinputph = 'finish';
			let that = this;
			this.playCorrectSound(()=>{
				that.moveNext();
			});
			//this.enter(false);
			
		}
	}

	//	Bad button click
	bad() {
		if(this.uinputph === 'question'){
			this.uinputph = 'rec';
			this.playContentDescription();
		}
	}

	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag: boolean = false;

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			
			//	Play card description
			//this.playContentDescription();
			this.uinputph = 'rec';
			this.playCardDescription();
			this.disableMoveNext();
				
			
			this.prevent_dubling_flag = true;

			//if(this.global_recorder) this.showGoodBad();
		}
		
	}

	//	Card hide hook
	hide() {
		this.prevent_dubling_flag = false;
		//	Hide option buttons
		this.optionHide();
		this.enterHide();
	}

	setFocus(){};

	//	Overload default repeat and play last uncomplete question
	public lastUncomplete = null;
	repeat() {
		//this.playContentDescription();
		this.playmedia.stop();
		this.uinputph = 'rec';
		this.playCardDescription();
	}

	playAnswerLetters(cb) {
		let ltrs = this.word_letters.split('');
		let that = this;
		for(let i in ltrs){
			let l = ltrs[i];
			//	Check last letter
			if(parseInt(i) === ltrs.length - 1){
				this.playmedia.word(l, function(){
					
    				if(typeof cb !== 'undefined') cb();
					if(that.uinputph === 'compare' || that.uinputph === 'question'){
						that.playmedia.sound('_S'+that.word_letters, function(){
							that.uinputph = 'question';
							setTimeout(function(){ that.playContentDescription(); }, 500);
						}, 400);
						
					}
					if(that.uinputph === 'listen'){
						that.playmedia.sound('_S'+that.word_letters, function(){
							
						}, 400);
						
					}
    			}, 1);
			} else {
				this.playmedia.word(l, function(){}, 1);
			}
		}

	}

	playWord() {
		this.playmedia.word(this.answer_word, function(){}, 1);
	}

	playCardDescription() {

		let that = this;
		//	This is the letter ...
		const pr1 = Observable.create((observer) => {
		  
			that.lastUncomplete = that.card.content[0].Instructions[0];
			let i = that.card.content[0].Instructions[0];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
			if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.playmedia.sound(i.audio, function(){}, 1);
    			that.playAnswerLetters(function(){ observer.next(0); observer.complete(); });
    			
    		} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		    
		})
		//	Its keyword is ...
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].Instructions.length > 1){
				that.lastUncomplete = that.card.content[0].Instructions[1];
				let i = that.card.content[0].Instructions[1];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){}, 1);
	    			that.playmedia.word(this.answer_word, function(){
	    				observer.next(0); observer.complete();
	    			}, 1);
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
		  });
		}))
		//	The sound of the letter in the keyword...
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].Instructions.length > 2){
				that.lastUncomplete = that.card.content[0].Instructions[2];
				let i = that.card.content[0].Instructions[2];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){
	    				observer.next(0); observer.complete();
	    			}, 1);
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ that.playContentDescription(); observer.next(0); observer.complete(); }, 1);
		  });
		}))
		//	is3 (template for .... in Card Deck)
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].Instructions.length > 3){
				that.lastUncomplete = that.card.content[0].Instructions[3];
				let i = that.card.content[0].Instructions[3];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){}, 1);
	    			that.playmedia.sound('_S'+that.word_letters, function(){
	    				observer.next(0); observer.complete();
	    			}, 1);
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ that.playContentDescription(); observer.next(0); observer.complete(); }, 1);
		  });
		}))
		//	Look at your card deck and find the card for this letter.
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {
		    if(that.card.content[0].Instructions.length > 4){
				that.lastUncomplete = that.card.content[0].Instructions[4];
				let i = that.card.content[0].Instructions[4];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){
	    				observer.next(0); observer.complete();
	    			}, 1);
	    		} else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
	    	} else setTimeout(function(){ that.playContentDescription(); observer.next(0); observer.complete(); }, 1);
		  });
		}));
		//	Write a sentence on the card using the keyword...
		pr1.subscribe((finalResult) => {
		  if(that.card.content[0].Instructions.length > 5){
				that.lastUncomplete = that.card.content[0].Instructions[5];
				let i = that.card.content[0].Instructions[5];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
	    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
	    			that.playmedia.sound(i.audio, function(){}, 1);
	    			that.playmedia.word(that.answer_word, function(){
	    				that.playContentDescription();
	    			}, 1);
	    		} else  setTimeout(function(){ that.playContentDescription(); }, 1);
	    	} else setTimeout(function(){ that.playContentDescription(); }, 1);
		});

	}


	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		
		let that = this;
		//	Phase 4 question
		if(typeof this.card.content[0].Questions !== 'undefined' && this.card.content[0].Questions.length > 0 && this.uinputph === 'question'){
			this.lastUncomplete = this.card.content[0].Questions[0];
			this.card.content[0].desc = this.card.content[0].Questions[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Questions[0].pointer_to_value);
			if(this.global_recorder) this.showGoodBad();
			this.playmedia.sound(this.card.content[0].Questions[0].audio, function(){
				
				that.blinkGoodBad();

			}, 1);
			
		}
		//	Phase 1 rec instructions, if mic is enabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].RecInst[0].pointer_to_value);
			if(this.card.content[0].RecInst.length == 0) this.blinkRec();
			this.playmedia.sound(this.card.content[0].RecInst[0].audio, function(){}, 1);
			this.playAnswerLetters(()=>{
				if(typeof that.card.content[0].RecInst !== 'undefined' && that.card.content[0].RecInst.length > 1){
					that.card.content[0].desc = that.card.content[0].RecInst[1].pointer_to_value;
					that.setGlobalDesc(that.card.content[0].RecInst[1].pointer_to_value);
					that.blinkRec();
					that.playmedia.sound(that.card.content[0].RecInst[1].audio, function(){
						that.playmedia.sound('_S'+that.word_letters, function(){}, 1);
					}, 1);
				}
			});
		}
		//	Phase 1 rec instructions, if mic is disabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.uinputph = 'finish';
			this.enter(true);
		}
		//	Phase 2 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].PlayInst[0].pointer_to_value);
			this.blinkPlay();
			this.playmedia.sound(this.card.content[0].PlayInst[0].audio, function(){}, 1);
		}
		//	Phase 3 compare instructions
		else if(typeof this.card.content[0].CompInst !== 'undefined' && this.card.content[0].CompInst.length > 0 && this.uinputph === 'compare'){
			
			this.lastUncomplete = this.card.content[0].CompInst[0];
			this.card.content[0].desc = this.card.content[0].CompInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].CompInst[0].pointer_to_value);
			this.blinkLetter();
			this.playmedia.sound(this.card.content[0].CompInst[0].audio, function(){}, 1);
		}
		
	}

	//	Blink letter
	blinkLetter() {
		let that = this;
		setTimeout(()=>{
	      that.blinkletter = true;
	      setTimeout(()=>{
	        that.blinkletter = false;
	        setTimeout(()=>{
	          that.blinkletter = true;
	          setTimeout(()=>{
	            that.blinkletter = false;
	          }, 400);
	        }, 400);
	      }, 400);
	    }, 400);
	}

	//	Blink Good Bad buttons
	blinkGoodBad() {
		this.blink_good_bad.emit();
	}



}