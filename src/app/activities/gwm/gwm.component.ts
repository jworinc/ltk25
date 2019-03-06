import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-gwm',
  templateUrl: './gwm.component.html',
  styleUrls: ['./gwm.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GwmComponent extends BaseComponent implements OnInit {

    constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gwmlog: LoggingService, private gwmcs: ColorschemeService) {
  		super(elm, sanitizer, playmedia, gwmlog, gwmcs);
    }

    ngOnInit() {
    	this.setHeader();
    	this.display_result = {right: 0, wrong: 0};
    	this.current_number = +this.data.cross_number;
		this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();

		this.card = this.data;
		
		this.current_header = this.card.header;

		this.setWords();

    }

  	//	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public input_data = '';

	public words = [];

	public answers = [];
	public audios = [];
	public expected = [];
	public display_result: any;

	//	Define current card number
	public current_number: any;
	public card_id: any;
	
	public current_set = 0;
	public expected_string: any;
	public current_word: any;
	
	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
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

	//	Enter click handler
	/*
	enter() {
		if(this.uinputph === 'finish'){
			this.playCorrectSound();
			this.enableNextCard();
		} else {
			this.playmedia.sound('_STNQR', function(){});
		}
	}
	*/

	repeat(){
		if(this.uinputph !== 'finish'){
			this.playCardDescription();
		} else {
			this.enter();
		}
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

	setFocus(){
		
	};

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {

		this.playmedia.word(this.audios[this.current_word], function(){}, 300);
		
	}

	setWords() {

		this.words = [];
		this.audios = [];

		for(var i in this.card.content[0].parts[this.current_set]){
			var w = this.card.content[0].parts[this.current_set][i];
			this.words.push(w.title);
			this.audios.push(w.wavename);
		}

		this.current_word = Math.floor(Math.random() * (this.card.content[0].parts[this.current_set].length));

		this.expected.push(this.words[this.current_word]);

		this.card_object = 'Word';
		this.card_instance = this.words[this.current_word];
		this.expected_string = this.words[this.current_word];

	}

	getWords() {

		//	Check if all letters are entered
		if(this.expected.length >= this.card.content[0].parts.length){
			this.showResults();
			return;
		}

		this.current_set++;
		this.setWords();
		let that = this;
		this.playmedia.word(this.audios[this.current_word], function(){
			that.current_presented++;
		}, 300);

	}

	addAnswer(ind) {

		if(this.answers.length >= this.expected.length) return;

		this.input_data = this.words[ind];
		if(this.words[ind] !== this.words[this.current_word]) this.result();

		this.answers.push(this.words[ind]);

		this.getWords();

	}

	showResults(){
		for(var i in this.answers){
			var a = this.answers[i];
			var e = this.expected[i];
			if(a === e) this.display_result.right++;
			else this.display_result.wrong++;
		}

		this.card.content[0].desc = '';

		

		this.elm.nativeElement.querySelector('.gsc-letters').style.display = 'none';
		this.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';
		let that = this;
		//	Play chimes
		this.playmedia.action('CHIMES', function(){
			that.uinputph = 'finish';
			that.enter();
		}, 300);

	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			this.enableNextCard();
		} 
	}



}