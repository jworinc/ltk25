import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-baseor',
  templateUrl: './baseor.component.html',
  styleUrls: ['./baseor.component.scss']
})
export class BaseorComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private borlog: LoggingService, private borcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, borlog, borcs);

  }

  ngOnInit() {
  	
  }


  	//	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_hint_level = 0;

	public max_hint_level = 3;

	public input_data = '';

	public letters = [];

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public card: any;
	
	public words = [];
	public audios = [];
	public current_word = 0;
	public answer_word = '';
	
  	public expected_string = '';


	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			let that = this;
			this.playCorrectSound(()=>{
				that.enableNextCard();
				that.moveNext();
			});
			
		} else {
			if(this.getUserInputString() !== '') this.playmedia.sound('_STNQR', function(){});
			else this.repeat();
		}
	}

	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag: boolean = false;

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

	hide() {
		this.prevent_dubling_flag = false;
		//	Hide option buttons
		this.optionHide();
		this.enterHide();
	}

	setFocus(){
		
	};

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		
		//	Phase 1 rec instructions, if mic is enabled
		if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkRec();
			this.playmedia.sound(this.card.content[0].RecInst[0].audio, function(){});
			this.playmedia.word(this.audios[this.current_word], function(){}, 100);
		}
		//	Phase 1 rec instructions, if mic is disabled
		if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.uinputph = 'compare';
			setTimeout(function(){ that.playContentDescription(); }, 500);
		}
		//	Phase 2 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkPlay();
			this.playmedia.sound(this.card.content[0].PlayInst[0].audio, function(){});
		}
		//	Phase 3 compare instructions
		else if(typeof this.card.content[0].CompInst !== 'undefined' && this.card.content[0].CompInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].CompInst[0];
			this.card.content[0].desc = this.card.content[0].CompInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.blinkWord();
			this.playmedia.sound(this.card.content[0].CompInst[0].audio, function(){});
		}
	}
	
	playWord(){
		let that = this;
		this.playmedia.stop();
		this.playmedia.word(this.audios[this.current_word], function(){
			if(that.uinputph === 'compare'){
				if(that.current_word < that.words.length - 1){
					setTimeout(function(){
						that.current_word++;
						that.uinputph = 'rec';
						that.answer_word = that.words[that.current_word];
						that.playContentDescription();
					}, 1500);
				} else {
					that.uinputph = 'finish';
					that.enableMoveNext();
					that.enter();
				}
				
				
			}
		});
	}

	//	Create formated user input string for errors log
	getUserInputString() {
		return this.input_data;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.expected_string;
	}



}
