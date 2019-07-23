import { Directive, ElementRef } from '@angular/core';
import { PlaymediaService } from '../services/playmedia.service';

@Directive({
  selector: '[app-playwords]'
})
export class PlaywordsDirective {

  constructor(private elmt: ElementRef, private pms: PlaymediaService) { 
  	this.initText();
  }	

	//	Get content of element which words must be playable
	public innerText = '';
	//	RegExp for seaching HTML tags in text
	public html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
	//	RegExp find extra spaces
	public space_to_one = /[\s]+/g;
	//	RegExp to find punctuation characters
	public punctuation = /[\,\:\;\"\!\?\'\-\u2000-\u2060]/g;
	//	RegExp to find dots
	public dots = /\./g;

	public items: any;
	
	//	Convert plain words string to array
	public words_arr: any;
	//	Prepare buffer for filtering unique words
	public unique_words = [];
	
	initText() {
		//	Get content of element which words must be playable
		this.innerText = this.elmt.nativeElement.innerHTML;
		//	Check if nothing in element then go back
		if(this.innerText === "") return;
		//	Filter markup to leave only words with spaces as delimiter
		this.innerText = this.innerText.replace(this.html, '').replace(this.space_to_one, ' ').replace(this.punctuation, '').replace(this.dots, ' ');
	  	//	Convert plain words string to array
		this.words_arr = this.innerText.split(' ');

		//	Find unique words in all words array
		for(let i in this.words_arr)	{
			let w = this.words_arr[i];
			if(this.unique_words.indexOf(w) >= 0 || w === ' ' || w === '') continue;
			this.unique_words.push(w);
		}

		console.log('Unique words: ' + this.unique_words);

		//	Replace HTML with wrapped words in HTML span element
		let w_html = this.elmt.nativeElement.innerHTML;
		for(let i in this.unique_words){
			let w = this.unique_words[i];
			let reg = new RegExp('\\b'+w+'(?!\=)\\b', 'g');
			w_html = w_html.replace(reg, '<span data-playw="'+w+'" data-click-ev-bound="false">'+w+'</span>');
		}
		//	Put back updated HTML
		this.elmt.nativeElement.innerHTML = w_html;

		let that = this;
		setTimeout(()=>{
			that.bindWordplayClickEvent();
		}, 10);

	}

	resetWordBackground() {
		this.items.forEach((el)=>{
			el.style.backgroundColor = 'transparent';
		});
	}
	

	//	Iterate via all playable words and bind to it click event
	//	to start play, also performs checking to prevent event double binding
	bindWordplayClickEvent(){

		let that = this;

		//	Iterate playable words
		let elms = this.items = this.elmt.nativeElement.querySelectorAll('span[data-playw]');
		for(let e in elms){
			//	Get current playable word
			let pw = elms[e];
			//	Check if event is not binded yet
			if(typeof pw !== 'undefined' && typeof pw.attributes !== 'undefined' && pw.attributes["data-click-ev-bound"].value !== "true"){
				//	Bind onclick event
				pw.onclick = function(){
					
					//	Get name of the file which must be played
					let an = pw.attributes['data-playw'].value;
					
					//	Mark clicked word and clear mark on rest of the words
					//angular.element('span[data-playw]').css('background-color', 'transparent');
					that.resetWordBackground();
					pw.style.backgroundColor = '#00ADEF';
					that.pms.stop();
					that.pms.word(an, ()=>{});
					
				};

				//	Mark word as binded with onclick play event
				pw.setAttribute("data-click-ev-bound", "true");

			}
		}

	}

}
