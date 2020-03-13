import { Component, OnInit, Input, ElementRef, DoCheck, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasebwComponent } from '../basebw/basebw.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';
import { MultiselectComponent } from '../../components/multiselect/multiselect.component';

@Component({
  selector: 'app-bw2',
  templateUrl: './bw2.component.html',
  styleUrls: ['./bw2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw2Component extends BasebwComponent implements OnInit, DoCheck {

	constructor(private element:ElementRef, 
							private sz: DomSanitizer, 
							private pms: PlaymediaService, 
							private bw2log: LoggingService, 
							private bw2cs: ColorschemeService,
							private op: OptionService) {
  	super(element, sz, pms, bw2log, bw2cs);
	}
	
	public enable_handle_vowel: boolean = false;

	
	@ViewChild(MultiselectComponent) msel: MultiselectComponent;


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
	let op = this.op.getOptions();
	this.max_presented = this.getMaxPresented(this.max_repetitions, op);
	
	this.setCard();

	//	User answer phases, letters, sounds and vowel sound, rec, listen, compare, finish
	this.uinputph = 'letters';

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

  	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		//	Phase 1 how many letters
		if(typeof this.card.content[0].Question1 !== 'undefined' && this.card.content[0].Question1.length > 0 && this.uinputph === 'letters'){
			this.lastUncomplete = this.card.content[0].Question1[0];
			this.card.content[0].desc = this.card.content[0].Question1[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content[0].Question1[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
		} 
		//	Phase 2 how many sounds
		else if(typeof this.card.content[0].Question2 !== 'undefined' && this.card.content[0].Question2.length > 0 && this.uinputph === 'sounds'){
			this.lastUncomplete = this.card.content[0].Question2[0];
			this.card.content[0].desc = this.card.content[0].Question2[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content[0].Question2[0].audio, function(){
				that.setFocus();
				that.input_data = '';
			});
		}
		//	Phase 3 vowel sound
		else if(typeof this.card.content[0].Question3 !== 'undefined' && this.card.content[0].Question3.length > 0 && this.uinputph === 'vowel'){
			this.lastUncomplete = this.card.content[0].Question3[0];
			this.card.content[0].desc = this.card.content[0].Question3[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.showEnter();
			this.pms.sound(this.card.content[0].Question3[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
		}
		//	Phase 4 rec instructions, if mic is enabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.enterHide();
			this.blinkRec();
			this.pms.sound(this.card.content[0].RecInst[0].audio, function(){});
		}
		//	Phase 4 rec instructions, if mic is disabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.finishOrContinueBW();
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
		else if(typeof this.card.content[0].NextInstt !== 'undefined' && this.card.content[0].NextInstt.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].NextInstt[0];
			this.card.content[0].desc = this.card.content[0].NextInstt[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkWord();
			this.pms.sound(this.card.content[0].NextInstt[0].audio, function(){});
		}
	}


    //	Phase incorrect message
	respIfIncorrect() {
		//[1].content["0"]["RespIf Incorrect1"]
		let digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
		let that = this;
		if(this.uinputph === 'letters'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect1"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content["0"]["RespIfIncorrect1"][0].audio, function(){
				that.clearUserInput(); that.setFocus();
			});
			
		}
		else if(this.uinputph === 'sounds'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect2"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content["0"]["RespIfIncorrect2"][0].audio, function(){
				that.clearUserInput(); that.setFocus();
			});
		}
		else if(this.uinputph === 'vowel'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect3"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			let resp_key = "";
			this.pms.sound(this.card.content["0"]["RespIfIncorrect3"][0].audio, function(){
				if(resp_key === "") return;
				that.card.content[0].desc = that.card.content["0"][resp_key][0].pointer_to_value;
				that.setGlobalDesc(that.card.content[0].desc);
			});
			if(typeof this.card.content[this.current_card_instance].skill !== 'undefined'){
				if(this.card.content[this.current_card_instance].skill === 'plurals'){
					resp_key = "RespIfIncorrectC3";
				}
				else if(this.card.content[this.current_card_instance].skill === 'plurales'){
					resp_key = "RespIfIncorrectC2";
				}
				else if(this.card.content[this.current_card_instance].skill === 'pluralvce'){
					resp_key = "RespIfIncorrectC1";
				}
				this.pms.sound(this.card.content["0"][resp_key][0].audio, function(){ 
					that.clearUserInput(); that.setFocus(); 
				});
				if(this.card.content["0"][resp_key].length > 1)
					this.pms.sound(this.card.content["0"][resp_key][1].audio, function(){});
			}
			
		}
	}

	//	Enter click handler
	//	Overload of default function, the target is to catch moment when user enter the word without 's'
	//	angular watcher creates a problem in this case, so this action must be approved by user with click enter button
	enter() {
		let that = this;
		
		if(this.uinputph === 'vowel' && this.input_data !== '' && this.enable_handle_vowel){
			this.pms.stop();
			if(this.input_data.toLowerCase() === this.expected){
				this.uinputph = 'rec';
				this.enable_handle_vowel = false;
				this.playContentDescription();
				
			} else {

				//	Log user error
				this.card_object = 'Question';
				this.card_instance = this.expected_string = 'Enter the base word without the added "s". ' + this.answer_word + ' ('+this.expected+')';
				this.result();
				this.input_data = '';
				this.respIfIncorrect();
			}
			return;
		}
		else if((this.uinputph === 'vowel' || this.uinputph === 'letters' || this.uinputph === 'sounds' || this.uinputph === 'compare') && this.input_data === ''){
			this.pms.stop();
			this.repeat();
			return;
		}
		/*
		this.pms.stop();
		if(!this.validate()){
			this.pms.sound('_STNQR', function(){ 
				that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; that.playCardDescription();
			});
		} else {
			this.playCorrectSound(function(){ 
				that.enableNextCard();
			});
		}
		*/

		if(this.uinputph === 'finish' && this.current_presented >= this.max_presented){
			this.pms.stop();
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

	ngDoCheck() {}

	//	Watch if user type any data
	//ngDoCheck() {
	valueChange($event){
	    //const change = this.differ.diff(this.input_data);
	    //if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){
			if(this.isActive()) {
	    	//this.old_input_data = JSON.stringify(this.input_data);

	    	let that = this;
				this.pms.stop();
				this.play_pronouce_busy_flag = false;
				//	When current phase is letters, check if num letters match with user input and switch to next
				if(this.uinputph === 'letters' && this.input_data !== ''){
					if(this.input_data == this.expected){
						this.askNumSounds();
					} else {
						//	Log user error
						this.card_object = 'Question';
						this.card_instance = this.expected_string = 'How Many Letters? ' + this.answer_word + ' ('+this.expected+')';
						this.result();

						this.respIfIncorrect();
					}
				}
				//	Check if user input correct word without 's'/'es'
				if(this.uinputph === 'sounds' && this.input_data !== ''){
					if(+this.input_data === this.expected){
						this.uinputph = 'vowel'; // in this type of card we asked to enter word without plurals
						this.expected = '';
						//this.input_data = '';
						for(let i in this.card.content[this.current_card_instance].parts) {
							let p = this.card.content[this.current_card_instance].parts[i];
							if(parseInt(i) === this.card.content[this.current_card_instance].parts.length - 1) break;
							this.expected += p;
						}
						this.input_data = '';
						this.mselshow = false;
						//this.playContentDescription();
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

				if(this.uinputph === 'vowel' && this.input_data !== ''){
					this.enable_handle_vowel = true;
				}
				
				//	Validate user input and decide enable or not next card
				if(this.validate()){
					this.enableMoveNext();

				}
				else this.disableMoveNext();

			}
	    
	}

}