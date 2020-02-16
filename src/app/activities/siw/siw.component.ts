import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Or1Component } from '../or1/or1.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-siw',
  templateUrl: './siw.component.html',
  styleUrls: ['./siw.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class SiwComponent extends Or1Component implements OnInit {

  constructor(private siwel:ElementRef, private siwsn: DomSanitizer, private siwpm: PlaymediaService, private siwlog: LoggingService, private siwcs: ColorschemeService) {
  	super(siwel, siwsn, siwpm, siwlog, siwcs);
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
		this.words.push(this.data.content[0].parts[i].title);
		this.audios.push(this.data.content[0].parts[i].wavename);

	}
	
	this.answer_word = this.words[this.current_word];

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

  repeat() {
	this.siwpm.stop();
	this.play_card_description_busy = false;
	this.playCardDescription();
  }

}