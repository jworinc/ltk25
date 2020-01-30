import { Directive, ElementRef } from '@angular/core';
import { PlaymediaService } from '../services/playmedia.service';
import { OptionService } from '../services/option.service';
import { DataloaderService } from '../services/dataloader.service';

@Directive({
  selector: '[app-playwords]'
})
export class PlaywordsDirective {

  constructor(private elmt: ElementRef, private pms: PlaymediaService, private op: OptionService, private dl: DataloaderService) { 
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

	public innerWord = '';
	public word_translation: any = null;
	public trelm: any = null;
	public in_translation: boolean = false;
	public current_word: string = '';
	
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
			if(this.op.show_word_translation) 
				w_html = w_html.replace(reg, '<span data-playw="'+w+'" data-click-ev-bound="false" appWordtranslate class="translainable-word">'+
												w+
											 '<div>T</div></span>');
			else 
				w_html = w_html.replace(reg, '<span data-playw="'+w+'" data-click-ev-bound="false" appWordtranslate>'+w+'</span>');
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

				//	Set click event for translation
				if(this.op.show_word_translation){
					let tr = pw.querySelector('div');
					tr.addEventListener('click', (e)=>{
						that.clickToSeeTranslation.call(that, e);
					});
					tr.addEventListener('touchstart', (e)=>{
						that.clickToSeeTranslation.call(that, e);
					});
				}

			}
		}

	}

	clickToSeeTranslation(e) {
		e.stopPropagation();
		e.preventDefault();
		let that = this;
		this.in_translation = true;
		this.innerWord = e.target.parentNode.innerText.slice(0, -1);
		this.trelm = e.target;
		if(this.word_translation && this.current_word === this.innerWord) {
			setTimeout(()=>{
				that.trelm.classList.add("translation-expand");
				setTimeout(()=>{
					if(that.in_translation){
						that.trelm.innerHTML = "";
						that.trelm.innerText = that.word_translation.translation;
					}
				}, 200);
			}, 10);
			
		} else {
			that.trelm.innerText = ".";
			this.innerWord = e.target.parentNode.innerText.slice(0, -1);
			this.current_word = this.innerWord;
			if(this.innerWord === "") return;
			this.dl.getTranslation(this.innerWord).then((data)=>{
				if(typeof data === 'undefined') return;
				that.word_translation = data;
				console.log(data);
				if(that.in_translation) {
					that.trelm.innerHTML = "";
					that.trelm.innerText = (data as any).translation;
				}


			});
			console.log(this.innerWord);

			//  Change translation element to loading
			this.trelm.innerHTML = "";
			let load = document.createElement("span");
			load.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PGxpbmVhckdyYWRpZW50IGlkPSdGYXN0TG9hZGluZ0luZGljYXRvci1saW5lYXJHcmFkaWVudCcgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIHgxPScxLjc4MDQnIHkxPScxNi4wMzc5JyB4Mj0nMzAuMTQzOScgeTI9JzE2LjAzNzknPjxzdG9wIG9mZnNldD0nMC40MTY5JyBzdG9wLWNvbG9yPScjQ0RDRkQyJy8+PHN0b3Agb2Zmc2V0PScwLjkzNzYnIHN0b3AtY29sb3I9J3JnYmEoMjQ4LDI0OCwyNDksMCknLz48L2xpbmVhckdyYWRpZW50PjxjaXJjbGUgY3g9JzE2JyBjeT0nMTYnIHI9JzEyLjcnIHN0eWxlPSdmaWxsOiBub25lOyBzdHJva2U6IHVybCgjRmFzdExvYWRpbmdJbmRpY2F0b3ItbGluZWFyR3JhZGllbnQpOyBzdHJva2Utd2lkdGg6IDI7Jz48L2NpcmNsZT48L3N2Zz4=' alt='' style='display: block; position: relative; margin: auto; margin-top: 1px; width: 14px; height: 14px; line-height: 15px; transition: transform 1s linear; animation-name: trrotation; animation-duration: 1s; animation-iteration-count: infinite;' />";
			setTimeout(()=>{ 
				that.trelm.classList.add("translation-expand"); 
			}, 20);
			setTimeout(()=>{ 
				that.trelm.appendChild(load); 
			}, 40);
		}
		
		//this.trelm.appendChild(load);
	
	}

}
