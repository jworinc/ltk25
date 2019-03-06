import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Ar1Component } from '../ar1/ar1.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-ar4',
  templateUrl: './ar4.component.html',
  styleUrls: ['./ar4.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Ar4Component extends Ar1Component implements OnInit {

  constructor(private ar4el:ElementRef, private ar4sn: DomSanitizer, private ar4pm: PlaymediaService, private ar4log: LoggingService, private ar4cs: ColorschemeService) {
  	super(ar4el, ar4sn, ar4pm, ar4log, ar4cs);
  }

  ngOnInit() {
  		this.setHeader();
  		this.user_input_background = {
			'background-color': '#725A3F'
		}
		this.content_right_answer_word = {};
		this.content_right_missing_letter = {};
		this.current_number = +this.data.cross_number;
		this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();

		//	Add card data to the directive that
		this.card = this.data;
		
		//	Set current card header
		this.current_header = this.card.header;

		this.max_presented = this.card.content.length;


		//	User input phase
		this.uinputph = '';


		this.setCard();
  }

  	//	Hint 3 play sound of the blend AR3
	hintLevel3() {
		this.hintLevel1();
	}

	//	Hint 1, play sound letters AR4
	hintLevel1() {
		let that = this;
		//	Sound (letter) to play
		let sp: any;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].missing_letter;
			if(this.card.content[0].InstHint1.length > 0) {
				let fst = this.card.content[0].InstHint1[0];
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					this.ar4pm.sound(fst.audio, function(){});
					this.ar4pm.sound('_s'+sp, function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		}
	}

	//	Hint 2, play sound, play word, play right letter
	hintLevel2() {
		let that = this;
		//	Sound (letter) to play
		let sp: any;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			sp = this.card.content[this.current_card_instance].missing_letter;
			if(this.card.content[0].InstHint2.length > 0) {
				let fst = this.card.content[0].InstHint2[0];
				this.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block';
				this.card.content[0].desc = fst.pointer_to_value;
				this.setGlobalDesc(fst.pointer_to_value);
				if(typeof fst.audio !== 'undefined' && fst.audio !== ''){
					that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block'; 
					that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '1';
					setTimeout(function(){ 
						that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block';
						that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '0';
						setTimeout(function(){ 
							that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.display = 'block';
							that.ar4el.nativeElement.querySelector('.content_right_missing_letter').style.opacity = '0'; 
						}, 500) 
					}, 3000);
					this.ar4pm.sound(fst.audio, function(){});
					this.ar4pm.word(sp, function(){ that.hint_busy = false; that.setFocus(); });
				} else {
					setTimeout(function(){
						
						that.hint_busy = false; that.setFocus(); 
						
					}, 3000);
				}
			}
			
				
		} 
	}

}