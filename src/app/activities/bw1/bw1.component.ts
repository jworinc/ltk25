import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasebwComponent } from '../basebw/basebw.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-bw1',
  templateUrl: './bw1.component.html',
  styleUrls: ['./bw1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw1Component extends BasebwComponent implements OnInit {

  constructor(private element:ElementRef, 
			  private sz: DomSanitizer, 
			  private pms: PlaymediaService, 
			  private bw1log: LoggingService, 
			  private bw1cs: ColorschemeService,
			  private op: OptionService) {
  	super(element, sz, pms, bw1log, bw1cs);
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



}