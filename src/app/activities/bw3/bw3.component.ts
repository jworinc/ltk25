import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasebwComponent } from '../basebw/basebw.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-bw3',
  templateUrl: './bw3.component.html',
  styleUrls: ['./bw3.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw3Component extends BasebwComponent implements OnInit, DoCheck {

  
  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private bw3log: LoggingService, private bw3cs: ColorschemeService) {
  	super(element, sz, pms, bw3log, bw3cs);
  }

  public display_answer_word: any;
  public syllables: any;

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
	this.uinputph = 'syllable';

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

    setCard() {
				
		this.input_data = '';
		this.answer_word = '';
		this.display_answer_word = '';
		let content = '';
		this.element.nativeElement.querySelector('.bw3-letters-wrap').style.opacity = '0';
		this.uinputph = 'syllable';
		this.main_description_part_played = false;

		let syl = '';
		
		let ci = this.current_card_instance;

		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i];
			syl += cn;
			this.answer_word += cn.replace(/\-/ig, '');

		}

		this.display_answer_word = this.answer_word;

		//	Breakdown syllables
		this.syllables = syl.split('-');


		//	Expected result
		this.expected = '';
		for(let i in this.syllables) {
			let s = this.syllables[i];
			if(s.match(/air|ar|ear|er|ur|ir|ire|or|ore|rr|ure/ig) !== null) this.expected = this.expected_string = s;
		}
		
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
		}
		
	}

	//	Overload default play description function
	playCardDescription() {

		//	Play the first instruction insequence
		function instructionFirst() {
			let that = this;
			this.lastUncomplete = this.card.content[0].instructions[0];
			let i = this.card.content[0].instructions[0];
			this.card.content[0].desc = i.pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			this.pms.sound(i.audio, function(){
    				that.setFocus();
    			});
    		}
    		this.main_description_part_played = true;
			
		}
		instructionFirst.call(this);
		
	}

	//	Overload default repeat and play last uncomplete question
	repeat() {
		if(this.uinputph === 'syllable') this.playCardDescription();
		else this.playContentDescription();
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {

		let that = this;
		
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
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.finishOrContinueBW(function(){ this.playCardDescription(); });
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
		else if(typeof this.card.content[0].NextInst !== 'undefined' && this.card.content[0].NextInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].NextInst[0];
			this.card.content[0].desc = this.card.content[0].NextInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkWord();
			this.pms.sound(this.card.content[0].NextInst[0].audio, function(){});
		}
	}

	//	Phase incorrect message
	respIfIncorrect() {
		let that = this;
		if(typeof this.card.content[0].RespIfIncorrect !== 'undefined' && this.card.content[0].RespIfIncorrect.length > 0) {
			let i = this.card.content[0].RespIfIncorrect[0];
			this.card.content[0].desc = i.pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(i.audio, function(){
				let i = that.card.content[0].RespIfIncorrect[1];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(that.card.content[0].desc);
				that.pms.sound(i.audio, function(){
					that.element.nativeElement.querySelector('.bw3-letters-wrap').style.opacity = '1';
				});
				that.pms.word(that.answer_word, function(){
					that.clearUserInput(); that.setFocus();
				});
			});
		}
	}

	//	Enter click handler
	//	Overload of default function, wait when user enter r-controlled syllable and play response correct or not
	enter() {
		let that = this;
		
		if(this.uinputph === 'syllable' && this.input_data !== ''){
			
			if(this.input_data.toLowerCase() === this.expected.toLowerCase()){
				this.uinputph = 'rec';
				this.playContentDescription();
			} else {
				//	Log user error
				this.card_object = 'Sound';
				this.card_instance = this.answer_word;
				this.result();
				
				this.respIfIncorrect();
				
			}
			return;
		}


		this.pms.stop();
		if(!this.validate()){
			this.pms.sound('_STNQR', function(){ 
				that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; that.playCardDescription();
			});
		} else {
			this.playCorrectSound(function(){ 
				that.enableNextCard(); 
				//this.playRightAnswer();
			});
		}
		
	}


	public play_word_busy_flag:boolean = false;
	playWord(){

		if(this.play_word_busy_flag) return;
		this.play_word_busy_flag = true;
		let hletter = 0;
		let pr = this.card.content[this.current_card_instance].parts;
		let that = this;
		//	Play word
		this.pms.word(this.answer_word, function(){
			//	Start hilight letters when word play will complete
			that.display_answer_word = that.hilightWordLetter(pr, hletter);
			
		});

		//	Play pronuncuation of the word
		if(typeof this.card.content[this.current_card_instance].pronounce !== 'undefined' && this.card.content[this.current_card_instance].pronounce.length > 0){

			//	Delay before play each sound
			let del = 400;
			let hletter = 0;
			for(let i in this.card.content[this.current_card_instance].pronounce) {
				let p = '_S' + this.card.content[this.current_card_instance].pronounce[i]; p = p.replace('-', '');
				
				//	Check if we play the last sound, switch user input phase to next and play next instructions
				if(parseInt(i) === this.card.content[this.current_card_instance].pronounce.length - 1){
					this.pms.sound(p, function(){
						if(that.uinputph === 'compare'){
							that.uinputph = 'finish';
							setTimeout(function(){ 
								that.finishOrContinueBW(function(){ that.playCardDescription(); });
							}, del*2);
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
	

	//	Watch if user type any data
	ngDoCheck() {
	    //const change = this.differ.diff(this.input_data);
	    if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){

	    	this.old_input_data = JSON.stringify(this.input_data);

	    	let that = this;

			//	When current phase is letters, check if num letters match with user input and switch to next
			if(this.uinputph === 'letters' && this.input_data !== ''){
				if(this.input_data == this.expected){
					this.uinputph = 'sounds';
					this.expected = this.card.content[this.current_card_instance].sounds;
					this.playContentDescription();
					return;
				} else this.respIfIncorrect();
			}
			//	Check if user input correct word without 's'/'es'
			if(this.uinputph === 'sounds' && this.input_data !== ''){
				if(this.input_data === this.expected){
					this.uinputph = 'vowel';
					this.expected = '';
					for(let i in this.card.content[this.current_card_instance].parts) {
						let p = this.card.content[this.current_card_instance].parts[i];
						if(parseInt(i) === this.card.content[this.current_card_instance].parts.length - 1) break;
						this.expected += p;
					}
					this.playContentDescription();
					return;
				} else this.respIfIncorrect();
			}
			
			//	Validate user input and decide enable or not next card
			if(that.validate()){
				that.enableMoveNext();

			}
			else that.disableMoveNext();

	    }
	    
	}


}