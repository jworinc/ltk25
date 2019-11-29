import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-rp1',
  templateUrl: './rp1.component.html',
  styleUrls: ['./rp1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Rp1Component extends BaseComponent implements OnInit {

    constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private rp1log: LoggingService, private rp1cs: ColorschemeService) {
  	  super(elm, sanitizer, playmedia, rp1log, rp1cs);
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
		for(let i = 0; i < this.data.content[0].parts.length; i++) {

			//	Get current list item
			this.letters.push(this.data.content[0].parts[i].title);
			this.audios.push(this.data.content[0].parts[i].wave);
			if(typeof this.data.content[0].parts[i].format !== 'undefined'){
				let f = this.data.content[0].parts[i].format.toLowerCase();
				if(f === 'wmf'){
					f = 'png';
					this.pictures.push(this.playmedia.ltkmediaurl + '/storage/app/public/pic_png/' + this.data.content[0].parts[i].picture + '.' + f);
				} else {
					this.pictures.push(this.playmedia.ltkmediaurl + '/storage/app/public/Pictures/' + this.data.content[0].parts[i].picture + '.' + f);
				}
				
			} else {
				this.pictures.push('No image');
			}
		}
		
		this.current_img = this.pictures[this.current_letter];

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

    }


    //	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_img = '';
	
	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	public letters = [];
	public audios = [];
	public pictures = [];
	public current_letter = 0;
	

	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			if(this.getUserInputString() !== '') this.playCorrectSound();
			this.enableNextCard();
		} else {
			if(this.getUserInputString() !== '') this.playmedia.sound('_STNQR', function(){});
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
	
	repeat() {
		this.playContentDescription();
	}
	
	//	Decide if to play from letters/words folder or sound folder
	playLetterOrSound(a, cb){
		let callback = function(){};
		if(typeof cb !== 'undefined'){
			callback = cb;
		} 
		
		//	If we have underscore at the begining, it means that it is sound
		if(a.split('')[0] === '_'){

			this.playmedia.sound(a, function(){
				callback();
			}, 300);

		} else {
			this.playmedia.word(a, function(){
				callback();
			}, 300);
		}
	}

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
			//this.playLetterOrSound(this.audios[this.current_letter], function(){});
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
	
	playLetter(){
		let that = this;
		this.playmedia.stop();
		this.playLetterOrSound(this.audios[this.current_letter], function(){
			if(that.uinputph === 'compare'){
				if(that.current_letter < that.letters.length - 1){
					setTimeout(function(){
						that.current_letter++;
						that.uinputph = 'rec';
						that.current_img = that.pictures[that.current_letter];
						
						that.playContentDescription();
					}, 1500);
				} else {
					that.uinputph = 'finish';
					that.playCorrectSound();
					that.enableMoveNext();
					that.enter();
				}
				
				
			}
		});
	}

	blinkWord() {
		let that = this;
		setTimeout(function(){
			that.elm.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
			setTimeout(function(){
				that.elm.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'white';
				setTimeout(function(){
					that.elm.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
					setTimeout(function(){
						that.elm.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'white';
					}, 400);
				}, 400);
			}, 400);
		}, 400);
		
	}
	

}