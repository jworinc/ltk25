import { Directive, ElementRef, Input } from '@angular/core';
import { PlaymediaService } from '../services/playmedia.service';
import { OptionService } from '../services/option.service';
import { DataloaderService } from '../services/dataloader.service';
import { PickElementService } from '../services/pick-element.service';

@Directive({
  selector: '[app-playwords]'
})
export class PlaywordsDirective {

  constructor(private elmt: ElementRef, 
			  private pms: PlaymediaService, 
			  private op: OptionService, 
			  private dl: DataloaderService,
			  private pe: PickElementService) { 
  	this.initText();
  }	

	//	Get content of element which words must be playable
	public innerText = '';
	//	RegExp for seaching HTML tags in text
	public html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
	//	RegExp find extra spaces
	public space_to_one = /[\s]+/g;
	//	RegExp to find punctuation characters
	public punctuation = /[\,\:\;\"\!\?\-\u2000-\u2060]/g;
	//	RegExp to find dots
	public dots = /\./g;
	//	RegExp to find slashes
	public slashes = /[\/\-\_]/g;

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
	public origin_text = '';

	@Input() silentPlay: boolean;
	
	initText() {
		//	Get content of element which words must be playable
		this.innerText = this.elmt.nativeElement.innerHTML;
		this.origin_text = this.innerText;
		//	Check if nothing in element then go back
		if(this.innerText === "") return;
		let _wordarr = this.innerText.split(' ');
		//	Filter markup to leave only words with spaces as delimiter
		this.innerText = this.innerText.replace(this.html, '').replace(this.space_to_one, ' ').replace(this.punctuation, '').replace(this.dots, ' ').replace(this.slashes, ' ');
	  	//	Convert plain words string to array
		this.words_arr = this.innerText.split(' ');
		
		//	Find unique words in all words array
		for(let i in this.words_arr)	{
			let w = this.words_arr[i];
			//if(this.unique_words.indexOf(w) >= 0 || w === ' ' || w === '') continue;
			this.unique_words.push(w);
		}

		console.log('Unique words: ' + this.unique_words);

		//	Replace HTML with wrapped words in HTML span element
		let w_html = this.elmt.nativeElement.innerHTML;
		let proctext = this.origin_text;
		let customeHtml = '';
		let _html = '';
		let _words = [];
		for(let i in this.unique_words){
			let w = this.unique_words[i];
			let pw = w.replace("'", '');
			if(/[\d]+/.test(w)) continue;
			// let rg = new RegExp('\\b(?<!\-)'+w+'(?!(\<|\"\>|\=))\\b');
			const wordExistenceCount = this.origin_text.split(w).length - 1;
			let count = 0;

			if (this.op.show_word_translation) {
				// customeHtml = customeHtml + '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + ' <div>?</div></span>';
				_wordarr.forEach((word, index) => {
					let replacewords = word.replace('-', ' -');
					const split_word = replacewords.split(' ');
					let lastword  = split_word[length + 1];
					if(lastword){
						lastword = lastword.replace('-', '')
					}
					if (lastword && word.includes('-') && lastword==w) {
						_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + split_word[0] + '">' + split_word[0] + '<div>?</div></span>' + split_word[1];
					}
					if (wordExistenceCount == 1 && (word.replace('.', '') == w
						|| word.replace(',', '') == w || word.replace(':', ' ') == w
						|| word.replace('(', '') == w || word.replace('!', '') == w
						|| word.replace(')', '') == w || word.replace(';', '') == w)) {

						if (word.split(w).length > 1) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + '<div>?</div></span>' + word.split(w)[1];
							if (word.includes('(')) {
								_wordarr[index] = '' + '(' + '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + '<div>?</div></span>';
							}
						} else {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + ' <div>?</div></span>';
						}
						count = 1;
						return;
					}
					if (wordExistenceCount > 1 && word.replace('.', '') == w && count === 0) {
						const subwordExistenceCount = word.split('<span').length - 1;
						if (subwordExistenceCount == 0) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + ' <div>?</div></span>';
							count = 1;
							return;
						}

					}
				});

			} else {
				// customeHtml = customeHtml + '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + '</span>';
				// const wordExistenceCount = this.origin_text.split(w).length - 1;
				_wordarr.forEach((word, index) => {
					if (wordExistenceCount == 1 && word.replace('.', '') == w) {
						_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + '</span>';
						return;
					}
					if (wordExistenceCount > 1 && word.replace('.', '') == w) {
						const subwordExistenceCount = word.split('<span').length - 1;
						if (subwordExistenceCount == 0) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-playw="' + w + '">' + w + '</span>';
							return;
						}

					}
				});
			}
		}
		//	Put back updated HTML
		//this.elmt.nativeElement.innerHTML = w_html;
		this.elmt.nativeElement.innerHTML = _wordarr.join(' ');

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
				if(typeof this.silentPlay === 'undefined' || (typeof this.silentPlay !== 'undefined' && !this.silentPlay)){
					//	Bind onclick event
					pw.onclick = function(){
						//	If mouse event locked by feedback
    					if(that.pe.mouseLock()) return;
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

				//	Set click event for translation
				if(this.op.show_word_translation){
					let tr = pw.querySelector('div');
					tr.addEventListener('click', (e)=>{
						//	If mouse event locked by feedback
    					if(that.pe.mouseLock()) return;
						that.clickToSeeTranslation.call(that, e);
					});
					tr.addEventListener('touchstart', (e)=>{
						//	If mouse event locked by feedback
    					if(that.pe.mouseLock()) return;
						that.clickToSeeTranslation.call(that, e);
					});
				}

			}
		}

	}

	setTranslationPopup(content, word) {
		document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
			el.remove();
		});
		// Find root node for popup
		let rootclass = 'card-block-item';
		let rootn = null;
		let next_node = this.trelm.parentNode;
		for(let i = 0; i < 10; i++) {
			if(!next_node.classList.contains(rootclass)) {
				next_node = next_node.parentNode;
			} else {
				rootn = next_node;
				break;
			}
		}

		//	Create popup element
		let pp = document.createElement("div");
		pp.classList.add("translate-popup-init");
		setTimeout(()=>{ pp.classList.add("translate-popup-expanded"); }, 10);
		//setTimeout(()=>{ pp.innerText = content; }, 100);

		//	Create header
		let hh = document.createElement("h3");
		hh.innerText = word;
		pp.appendChild(hh);

		//	Create content
		let cn = document.createElement("span");
		cn.innerHTML = content;
		pp.appendChild(cn);
		let that = this;
		pp.onclick = (e)=>{
			//	If mouse event locked by feedback
			if(that.pe.mouseLock()) return;
			e.stopPropagation();
			e.preventDefault();
			pp.remove();
			document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
				el.remove();
			});
		}
		rootn.appendChild(pp);

	}

	showTranslation(translation, word) {
		if(translation.length < 2){
			this.trelm.innerHTML = "";
			this.trelm.innerText = translation;
			this.addPointerSign();
		} else {
			this.setTranslationPopup(translation, word);
			this.trelm.classList.remove("translation-expand");
			this.trelm.innerHTML = "?";
		}
	}

	clickToSeeTranslation(e) {
		e.stopPropagation();
		e.preventDefault();
		document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
			el.remove();
		});
		let that = this;
		this.in_translation = true;
		this.innerWord = e.target.parentNode.innerText.slice(0, -1);
		this.trelm = e.target;
		if(this.word_translation && this.current_word === this.innerWord) {
			setTimeout(()=>{
				that.trelm.classList.add("translation-expand");
				setTimeout(()=>{
					if(that.in_translation){
						that.showTranslation(that.word_translation.translation, that.innerWord);
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
				if(that.in_translation){
					that.showTranslation(that.word_translation.translation, that.innerWord);
				}


			});
			console.log(this.innerWord);

			//  Change translation element to loading
			this.trelm.innerHTML = "";
			let load = document.createElement("span");
			load.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PGxpbmVhckdyYWRpZW50IGlkPSdGYXN0TG9hZGluZ0luZGljYXRvci1saW5lYXJHcmFkaWVudCcgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIHgxPScxLjc4MDQnIHkxPScxNi4wMzc5JyB4Mj0nMzAuMTQzOScgeTI9JzE2LjAzNzknPjxzdG9wIG9mZnNldD0nMC40MTY5JyBzdG9wLWNvbG9yPScjQ0RDRkQyJy8+PHN0b3Agb2Zmc2V0PScwLjkzNzYnIHN0b3AtY29sb3I9J3JnYmEoMjQ4LDI0OCwyNDksMCknLz48L2xpbmVhckdyYWRpZW50PjxjaXJjbGUgY3g9JzE2JyBjeT0nMTYnIHI9JzEyLjcnIHN0eWxlPSdmaWxsOiBub25lOyBzdHJva2U6IHVybCgjRmFzdExvYWRpbmdJbmRpY2F0b3ItbGluZWFyR3JhZGllbnQpOyBzdHJva2Utd2lkdGg6IDI7Jz48L2NpcmNsZT48L3N2Zz4=' alt='' style='' />";
			setTimeout(()=>{ 
				that.trelm.classList.add("translation-expand"); 
			}, 20);
			setTimeout(()=>{ 
				that.trelm.appendChild(load); 
			}, 40);
		}
		
		//this.trelm.appendChild(load);
	
	}

	addPointerSign() {
		let that = this;
		let pointer = document.createElement("span");
		pointer.classList.add("translate-pointer");
		pointer.onclick = (e)=>{
			//	If mouse event locked by feedback
			if(that.pe.mouseLock()) return;
			e.stopPropagation();
			e.preventDefault();
		}
		this.trelm.appendChild(pointer);
		setTimeout(()=>{ pointer.style.top = '60%'; }, 10);
	}
	

}
