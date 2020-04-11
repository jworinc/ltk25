import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Rp1Component } from '../rp1/rp1.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PickElementService } from '../../services/pick-element.service';

@Component({
  selector: 'app-rp2',
  templateUrl: './rp2.component.html',
  styleUrls: ['./rp2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Rp2Component extends Rp1Component implements OnInit {

  constructor(private rp2el:ElementRef, 
			  private rp2sn: DomSanitizer, 
			  private rp2pm: PlaymediaService, 
			  private rp2log: LoggingService, 
			  private rp2cs: ColorschemeService,
			  private rp2pe: PickElementService) {
  	super(rp2el, rp2sn, rp2pm, rp2log, rp2cs, rp2pe);
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
			this.sounds.push(this.data.content[0].parts[i].title);
			if(typeof this.data.content[0].parts[i].format !== 'undefined'){
				let f = this.data.content[0].parts[i].format.toLowerCase();
				if(f === 'wmf'){
					f = 'png';
					this.pictures.push(this.rp2pm.ltkmediaurl+'/storage/app/public/pic_png/' + this.data.content[0].parts[i].picture + '.' + f);
				} else {
					this.pictures.push(this.rp2pm.ltkmediaurl+'/storage/app/public/Pictures/' + this.data.content[0].parts[i].picture + '.' + f);
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

  playLetter(){
	//	If mouse event locked by feedback
	if(this.rp2pe.mouseLock()) return;
	let that = this;
	this.rp2pm.stop();
	this.playLetterOrSound(this.audios[this.current_letter], function(){
		that.playLetterOrSound(that.sounds[that.current_letter], function(){
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
		
	});
}

}