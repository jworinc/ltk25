import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PickElementService } from '../../services/pick-element.service';

@Component({
  selector: 'app-gsc',
  templateUrl: './gsc.component.html',
  styleUrls: ['./gsc.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GscComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, 
			  private sanitizer: DomSanitizer, 
			  private playmedia: PlaymediaService, 
			  private gsclog: LoggingService, 
			  private gsccs: ColorschemeService,
			  private gscpe: PickElementService) {
  	super(elm, sanitizer, playmedia, gsclog, gsccs, gscpe);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_letter = Math.floor(Math.random() * 10);
  	this.display_result = {right: 0, wrong: 0};
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
	this.setCardNumber();
	//this.setCardId();

	this.card = this.data;
	
	this.current_header = this.card.header;

	//	Select 10 random letters
	for(var i = 0; i < 10; i++) {

		this.letters.push(this.selectRandomLetter());

	}

	this.expected.push(this.letters[this.current_letter]);


  }


  	//	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_hint_level = 0;

	public max_hint_level = 3;

	public input_data: any = '';

	public user_letter = 0;

	public alphabet = [
			{ letter: '', expected: 'A', disabled: false, mark: {} },
			{ letter: '', expected: 'B', disabled: false, mark: {} },
			{ letter: '', expected: 'C', disabled: false, mark: {} },
			{ letter: '', expected: 'D', disabled: false, mark: {} },
			{ letter: '', expected: 'E', disabled: false, mark: {} },
			{ letter: '', expected: 'F', disabled: false, mark: {} },
			{ letter: '', expected: 'G', disabled: false, mark: {} },
			{ letter: '', expected: 'H', disabled: false, mark: {} },
			{ letter: '', expected: 'I', disabled: false, mark: {} },
			{ letter: '', expected: 'J', disabled: false, mark: {} },
			{ letter: '', expected: 'K', disabled: false, mark: {} },
			{ letter: '', expected: 'L', disabled: false, mark: {} },
			{ letter: '', expected: 'M', disabled: false, mark: {} },
			{ letter: '', expected: 'N', disabled: false, mark: {} },
			{ letter: '', expected: 'O', disabled: false, mark: {} },
			{ letter: '', expected: 'P', disabled: false, mark: {} },
			{ letter: '', expected: 'Q', disabled: false, mark: {} },
			{ letter: '', expected: 'R', disabled: false, mark: {} },
			{ letter: '', expected: 'S', disabled: false, mark: {} },
			{ letter: '', expected: 'T', disabled: false, mark: {} },
			{ letter: '', expected: 'U', disabled: false, mark: {} },
			{ letter: '', expected: 'V', disabled: false, mark: {} },
			{ letter: '', expected: 'W', disabled: false, mark: {} },
			{ letter: '', expected: 'X', disabled: false, mark: {} },
			{ letter: '', expected: 'Y', disabled: false, mark: {} },
			{ letter: '', expected: 'Z', disabled: false, mark: {} },
		];

	public letters = [];

	public current_letter = 0;

	public answers = [];
	public expected = [];
	public display_result: any;


	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	selectRandomLetter() {
		var l = Math.floor(Math.random() * this.alphabet.length);
		
		while(this.letters.indexOf(this.alphabet[l].expected.toLowerCase()) >= 0){
			l = Math.floor(Math.random() * this.alphabet.length);
		}

		return this.alphabet[l].expected.toLowerCase();
	}

	//	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}

	//	Create formated user input string for errors log
	getUserInputString() {
		return this.letters[this.user_letter];
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.letters[this.current_letter];
	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			//if(!this.validate()) {
				
				//	Play card description
				this.playCardDescription();
				this.disableMoveNext();
				this.disableNextSlide();
			//} else {
			//	this.enableMoveNext();
			//}
			this.prevent_dubling_flag = true;
		}
		
	}

	next() {
		if(this.uinputph === 'finish'){
			this.enableNextCard(); this.moveNext();
		} else {
			this.repeat();
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

		this.playmedia.sound('_S'+this.letters[this.current_letter], function(){}, 300);
		
	}

	getLetter() {

		//	Check if all letters are entered
		if(this.expected.length >= this.letters.length){
			this.showResults();
			return;
		}

		this.current_letter = Math.floor(Math.random() * 10);
		while(this.expected.indexOf(this.letters[this.current_letter]) >= 0){
			this.current_letter = Math.floor(Math.random() * 10);
		}
		let that = this;
		this.playmedia.sound('_S'+this.letters[this.current_letter], function(){
			that.expected.push(that.letters[that.current_letter]);
			that.current_presented++;
		}, 300);

	}

	addAnswer(ind) {
		//	If mouse event locked by feedback
		if(this.gscpe.mouseLock()) return;

		if(this.answers.length >= this.expected.length) return;

		//	Logging user input errors
		this.user_letter = ind;
		this.card_object = 'letter';
		this.card_instance = this.letters[this.current_letter];
		if(this.letters[ind] !== this.letters[this.current_letter]) this.result();

		this.answers.push(this.letters[ind]);

		this.getLetter();

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
			that.enableNextCard(); that.moveNext();
		}, 300);

	}

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			this.enableNextCard(); this.moveNext();
		} 
	}




}