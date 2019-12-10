import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Bw3Component } from '../bw3/bw3.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-bw6',
  templateUrl: './bw6.component.html',
  styleUrls: ['./bw6.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw6Component extends Bw3Component implements OnInit {

	constructor(private bw6el:ElementRef, 
							private bw6sn: DomSanitizer, 
							private bw6pm: PlaymediaService, 
							private bw6log: LoggingService, 
							private bw6cs: ColorschemeService,
							private opbw6: OptionService) {
  	super(bw6el, bw6sn, bw6pm, bw6log, bw6cs, opbw6);
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
	//this.max_presented = this.card.content.length;

	//	Define number of repetitions
	this.max_repetitions = this.card.content.length;
	let op = this.opbw6.getOptions();
	this.max_presented = this.getMaxPresented(this.max_repetitions, op);

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

	public expected_suffix: any;
	public expected_suffix_sound: any;
	public answer_sound: any;
	public expected_digraf: any;

	setCard() {
				
		this.input_data = '';
		this.answer_word = '';
		this.display_answer_word = '';
		let content = '';
		
		this.bw6el.nativeElement.querySelector('.bw3-letters-wrap').style.transition = 'opacity 0s ease';
		this.bw6el.nativeElement.querySelector('.bw3-letters-wrap').style.opacity = '0';

		this.uinputph = 'rec';
		this.main_description_part_played = false;

		let ci = this.current_card_instance;
		
		//	Expected result digraf
		this.expected_suffix = '';
		this.expected_suffix_sound = '';

		//	The regular expressions for different conditions ()
		let r = null;
		if(typeof this.card.content[ci].SkillBase !== 'undefined' && this.card.content[ci].SkillBase !== ''){
			let sb = this.card.content[ci].SkillBase;
			if(sb === 'vt'){
				r = /au|augh|aw|ea|ee|ei|eigh|eu|ew|ex|ie|igh|oi|oo|ou|ow|oy|ue|ui/ig;
			}
			else if(sb === 'suf'){
				r = /able|en|est|ful|ing|ish|less|ly|ment|ness|fy|y/ig;
			}
			else if(sb === 'wcon'){
				r = /wa|war|wor|wr/ig;
			}
			else if(sb === 'wf'){
				r = /ald|alk|all|alm|alt/ig;
			}
			else if(sb === 'ED' || sb === 'ed' || sb === 'edd' || sb === 'edt'){
				r = /ed/ig;
			}
			else if(sb === 'num'){
				r = /eth|ion|teen|th|ty|y/ig;
			}
			else if(sb === 'le'){
				r = /ey/ig;
			}
			if(sb === 'tnt' || this.card.content[ci].skill === 'tntO'){
				r = /o/ig;
			}
		} else {
			r = /au|augh|aw|ea|ee|ei|eigh|eu|ew|ex|ie|igh|oi|oo|ou|ow|oy|ue|ui|able|en|est|ful|ing|ish|less|ly|ment|ness|fy|y|wa|war|wor|wr|ald|alk|all|alm|alt|d|t|eth|ion|teen|th|ty|ey|o/ig;
		}
		

		let syl = '';

		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i];
			syl += cn;
			this.answer_word += cn.replace(/\-/ig, '');
			if(cn.match(r) !== null){
				this.expected_suffix_sound = this.card.content[ci].pronounce[i].replace(/\-/ig, '');
				this.expected_suffix = cn.replace(/\-/ig, '');
			}

		}

		this.display_answer_word = this.answer_word;

		//	Breakdown syllables
		this.syllables = syl.split('-');

		//	Expected result
		this.expected = '';

		for(let i in this.syllables) {
			let s = this.syllables[i];
			if(s.match(r) !== null){
				//this.expected_suffix = s.match(r)[0];
				this.expected = this.expected_string = s;
			}
		}
		
		this.answer_sound = '';
		if(typeof this.card.content[ci].WaveName !== 'undefined' && this.card.content[ci].WaveName !== ''){
			this.answer_sound = this.card.content[ci].WaveName;
		} else {
			this.answer_sound = this.answer_word;
		}

		let that = this;
		setTimeout(()=>{
			that.bw6el.nativeElement.querySelector('.bw3-letters-wrap').style.transition = 'opacity 0.4s ease';
		}, 700);
			

	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				//this.playCardDescription();
				this.playContentDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.input_data = '';
		}
		
	}

	//	Overload default play description function
	playCardDescription() {

	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		this.enterHide();
		//	Phase 4 question
		if(typeof this.card.content[0].Question !== 'undefined' && this.card.content[0].Question.length > 0 && this.uinputph === 'question'){
			this.lastUncomplete = this.card.content[0].Question[0];
			this.card.content[0].desc = this.card.content[0].Question[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.showEnter();
			this.bw6pm.sound(this.card.content[0].Question[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
			//	In some cases we must play word and sound. To define when play what, check description containe string (SkillWave) or (word)
			if(this.card.content[0].Question[0].audio.match(/setlot6/ig) !== null)
				this.bw6pm.sound('_S'+this.expected_suffix_sound, function(){});
			else if(this.card.content[0].Question[0].audio.match(/setlo12|setlotw|setwwi/ig) !== null)
				this.bw6pm.word(this.answer_sound, function(){});
		}
		//	Phase 1 rec instructions, if mic is enabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkRec();
			this.bw6pm.sound(this.card.content[0].RecInst[0].audio, function(){});
			this.bw6pm.word(this.answer_sound, function(){}, 100);
		}
		//	Phase 1 rec instructions, if mic is disabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.uinputph = 'question';
			setTimeout(function(){ that.playContentDescription(); }, 100);
		}
		//	Phase 2 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkPlay();
			this.bw6pm.sound(this.card.content[0].PlayInst[0].audio, function(){});
		}
		//	Phase 3 compare instructions
		else if(typeof this.card.content[0].NextInst !== 'undefined' && this.card.content[0].NextInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].NextInst[0];
			this.card.content[0].desc = this.card.content[0].NextInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkWord();
			this.bw6pm.sound(this.card.content[0].NextInst[0].audio, function(){});
		}
	}

	//	Phase incorrect message
	respIfIncorrect() {
		let that = this;
		if(this.uinputph === 'question'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			let resp_key = "";
			this.bw6pm.sound(this.card.content["0"]["RespIfIncorrect"][0].audio, function(){
				if(resp_key === "") return;
				that.card.content[0].desc = that.card.content["0"][resp_key][0].pointer_to_value;
				that.setGlobalDesc(that.card.content[0].desc);
			});
			if(typeof this.card.content[this.current_card_instance].skill !== 'undefined'){
				let skill = this.card.content[this.current_card_instance].skill;
				if(typeof this.card.content[0].SkillA !== 'undefined' && this.card.content[0].SkillA.length > 0 && skill === this.card.content[0].SkillA[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectA !== 'undefined'){
					resp_key = "RespIfIncorrectA";
				}
				else if(typeof this.card.content[0].SkillB !== 'undefined' && this.card.content[0].SkillB.length > 0 && skill === this.card.content[0].SkillB[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectB !== 'undefined'){
					resp_key = "RespIfIncorrectB";
				}
				else if(typeof this.card.content[0].SkillC !== 'undefined' && this.card.content[0].SkillC.length > 0 && skill === this.card.content[0].SkillC[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectC !== 'undefined'){
					resp_key = "RespIfIncorrectC";
				}
				else if(typeof this.card.content[0].SkillD !== 'undefined' && this.card.content[0].SkillD.length > 0 && skill === this.card.content[0].SkillD[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectD !== 'undefined'){
					resp_key = "RespIfIncorrectD";
				}
				else if(typeof this.card.content[0].SkillE !== 'undefined' && this.card.content[0].SkillE.length > 0 && skill === this.card.content[0].SkillE[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectE !== 'undefined'){
					resp_key = "RespIfIncorrectE";
				}
				else if(typeof this.card.content[0].SkillF !== 'undefined' && this.card.content[0].SkillF.length > 0 && skill === this.card.content[0].SkillF[0].pointer_to_value && typeof this.card.content[0].RespIfIncorrectF !== 'undefined'){
					resp_key = "RespIfIncorrectF";
				}
				else {
					resp_key = "RespIfIncorrectA";
				}
				
				this.bw6pm.sound(this.card.content["0"][resp_key][0].audio, function(){ 
					that.clearUserInput(); that.setFocus();
					let letters = that.expected_suffix.split('');
					let rkey = resp_key;
					for(let i in letters){
						//	Check last
						if(parseInt(i) === letters.length - 1){
							that.bw6pm.word(letters[i], function(){
								if(that.card.content["0"][rkey].length > 1){
									that.card.content[0].desc = that.card.content["0"][rkey][1].pointer_to_value;
									that.setGlobalDesc(that.card.content[0].desc);
									that.bw6pm.sound(that.card.content["0"][rkey][1].audio, function(){
										that.bw6pm.sound('_S'+that.expected_suffix_sound, function(){
											that.uinputph = 'finish';
											that.playRespAtEnd();
										}, 300);
									});
								} else {
									that.uinputph = 'finish';
									that.playRespAtEnd();
								}
							}, 300);
						} else {
							that.bw6pm.word(letters[i], function(){}, 300);
						}
						
					}
				});
				
			}
			
		}
	}

	playRespAtEnd(){
		let that = this;
		if(typeof this.card.content[0].RespAtEnd !== 'undefined' && this.card.content[0].RespAtEnd.length > 0){
			this.card.content[0].desc = this.card.content[0].RespAtEnd[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.bw6pm.sound(this.card.content[0].RespAtEnd[0].audio, function(){});
			this.bw6pm.word(this.answer_sound, function(){
				that.finishOrContinueBW();
				//that.enableNextCard(); 
			}, 100);
		} else {
			this.finishOrContinueBW();
			//that.enableNextCard();
		}
		this.bw6el.nativeElement.querySelector('.bw3-letters-wrap').style.opacity = '1';
	}

	repeat() {
		//this.playContentDescription();
		this.bw6pm.stop();
		this.uinputph = 'rec';
		this.playContentDescription();
	}
	
	//	Enter click handler
	//	Overload of default function, the target is to catch moment when user enter the digraph
	//	angular watcher creates a problem in this case, so this action must be approved by user with click enter button
	public answer_question_received = false;
	enter() {
		let that = this;
		this.bw6pm.stop();
		if(this.uinputph === 'question' && this.input_data !== ''){
			if(this.input_data.toLowerCase() === this.expected_suffix.toLowerCase()){
				that.finishOrContinueBW(function(){ that.playCardDescription(); });
				//this.uinputph = 'finish';
				//that.playCorrectSound(function(){});
				//this.playRespAtEnd();

			} else {
				
				//	Log user error
				if(!this.answer_question_received){
					this.card_object = 'Sound';
					this.card_instance = this.answer_word;
					this.result();
					this.answer_question_received = true;
					setTimeout(()=>{ that.answer_question_received = false; }, 1000);
				}
				
				that.clearUserInput();
				this.bw6pm.stop();
				this.respIfIncorrect();
				
			}
			return;
		}
		else if(this.uinputph === 'question' && this.input_data === ''){
			this.bw6pm.stop();
			this.repeat();
			that.clearUserInput();
		}
		if(this.uinputph === 'finish' && this.current_presented >= this.max_presented){
			this.bw6pm.stop();
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
		/*
		if(this.uinputph === 'finish'){
			that.enableNextCard();
		}
		*/
		
	}


	playWord(){
		let that = this;
		this.bw6pm.word(this.answer_sound, function(){
			
				that.playPronounce(function(){
					if(that.uinputph === 'compare'){
						that.uinputph = 'question';
						setTimeout(function(){ that.playContentDescription(); }, 500);
					}
				});
				
			//}
		});
	}

	public play_pronouce_busy_flag: boolean = false;
	playPronounce(cb=()=>{}){

		if(this.play_pronouce_busy_flag) return;
		this.play_pronouce_busy_flag = true;

		let callback = cb;

		let hletter = 0;
		let pr = this.card.content[this.current_card_instance].parts;
		let that = this;
		//	Start hilight letters when word play will complete
		this.display_answer_word = this.hilightWordLetter(pr, hletter);
		

		//	Play pronuncuation of the word
		if(typeof this.card.content[this.current_card_instance].pronounce !== 'undefined' && this.card.content[this.current_card_instance].pronounce.length > 0){

			//	Delay before play each sound
			let del = 400;
			let ml = 0;
			let pm_immidiate_stop = this.bw6pm.immidiate_stop_event.subscribe(()=>{
				pm_immidiate_stop.unsubscribe();
				that.play_pronouce_busy_flag = false;
				hletter = 0;
				that.display_answer_word = that.hilightWordLetter(pr, hletter);
				that.clearUserInput();
			});
			for(let i in this.card.content[this.current_card_instance].pronounce) {
				let p = '_S' + this.card.content[this.current_card_instance].pronounce[i]; p = p.replace('-', '');
				//	Check if we play the last sound, switch user input phase to next and play next instructions
				if(parseInt(i) === this.card.content[this.current_card_instance].pronounce.length - 1){
					this.bw6pm.sound(p, function(){
						if(typeof callback !== 'undefined') setTimeout(function(){ callback(); }, del*2);
						that.play_pronouce_busy_flag = false;
						that.display_answer_word = that.answer_word;
						pm_immidiate_stop.unsubscribe();
					}, del);
				} else {
					this.bw6pm.sound(p, function(){
						ml++;
						//	Continue hilight letters according to prponuncuation
						hletter++;
						that.display_answer_word = that.hilightWordLetter(pr, hletter);
						
					}, del);
				}
			}
		}
	}

	ngDoCheck() {}

	//	Watch if user type any data
	//ngDoCheck() {
	valueChange($event){
	    //const change = this.differ.diff(this.input_data);
	    if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){

	    	this.old_input_data = JSON.stringify(this.input_data);

	    	let that = this;

			//	When current phase is letters, check if num letters match with user input and switch to next
			if(this.uinputph === 'letters' && this.input_data !== ''){
				if(this.input_data == this.expected){
					this.askNumSounds();
				} else this.respIfIncorrect();
			}
			//	Check if user input correct num of sounds
			if(this.uinputph === 'sounds' && this.input_data !== ''){
				if(this.input_data === this.expected){
					this.uinputph = 'digraf';
					this.expected = this.expected_digraf;
					
					this.playCardDescription();
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