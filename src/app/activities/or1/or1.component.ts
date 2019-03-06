import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseorComponent } from '../baseor/baseor.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-or1',
  templateUrl: './or1.component.html',
  styleUrls: ['./or1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Or1Component extends BaseorComponent implements OnInit {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private or1log: LoggingService, private or1cs: ColorschemeService) {
  	super(element, sz, pms, or1log, or1cs);
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



}