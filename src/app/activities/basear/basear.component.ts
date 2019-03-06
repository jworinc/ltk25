import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-basear',
  templateUrl: './basear.component.html',
  styleUrls: ['./basear.component.scss']
})
export class BasearComponent extends BaseComponent implements OnInit {

	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private barlog: LoggingService, private barcs: ColorschemeService) {
		super(elm, sanitizer, playmedia, barlog, barcs);

	}

	ngOnInit() {
		
	}


  	//	Set header for current card
	public current_header = '';
	public hint_delay = 800;
	
	//	Default hint level
	public current_hint_level = 0;
	public max_hint_level = 3;
	public current_card_instance = 0;
	public input_data: any;

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	//	Add card data to the directive scope
	public card: any;

	//	Here is user answer
	public result_value = 0;

	public hint_busy: boolean = false;
	//	Hint 1 handler
	public hint_1_started: boolean = false;
	//	Hint 1 handler
	public hint_2_started: boolean = false;
	//	Hint 3 handler
	public hint_3_started: boolean = false;

	public expected: any;
	public expected_string: any;
	public hint_2_show: any;
	public hint_3_show: any;
	public letters_cycle_started: boolean = false;
	
	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				//	Set focus on first empty input element
				this.setFocus();
				//	Play card description
				this.playCardDescription();
				this.disableMoveNext();
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.showHint();
		}
		
	}

	//	Callback for hide card event
	hidden() {
		if(!this.isActive() && this.prevent_dubling_flag){
			this.prevent_dubling_flag = false;
			
		}
	}

	//	Validate user answer
	validate(){
		if(typeof this.input_data !== 'undefined' && this.input_data !== null && this.input_data !== "" &&
			this.input_data.toLowerCase() == this.expected.toLowerCase())
			return true;
		else return false;
	}


	//	Create formated user input string for errors log
	getUserInputString() {
		return this.input_data;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.expected_string;
	}


	clearUserInput() {
		this.input_data = '';
	}
	
	
	hint() {
		if(this.hint_busy) return;
		this.hint_busy = true;
		this.current_hint_level++;
		if(this.current_hint_level > this.max_hint_level) this.current_hint_level = this.max_hint_level;
		if(this.current_hint_level === 1) this.hintLevel1();
		else if(this.current_hint_level === 2) this.hintLevel2();
		else if(this.current_hint_level === 3) this.hintLevel3();
		
	};

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		
	}

	continueOrFinishCard(){
		let that = this;
		if(this.current_presented < this.max_presented){
			this.playmedia.action('CHIMES', function(){
				setTimeout(function(){
					that.letters_cycle_started = false;
					that.current_card_instance++;
					that.setCard();
					setTimeout(function(){ 
						that.current_presented++;
						that.setFocus();
						//	Play card description
						that.playCardDescription();
						that.disableMoveNext();
					}, 300);
				}, 1000);
			}, 300);
				
		} else {
			this.letters_cycle_started = false;
			this.enter();
		}
	}

	hintLevel1() {

	}

	hintLevel2() {

	}

	hintLevel3() {

	}

	setCard() {

	}


}
