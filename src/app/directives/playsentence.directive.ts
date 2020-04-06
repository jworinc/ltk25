import { Directive, ElementRef, HostListener, HostBinding, Input } from '@angular/core';
import { PlaymediaService } from '../services/playmedia.service';
import { OptionService } from '../services/option.service';
import { DataloaderService } from '../services/dataloader.service';
import { forEach } from '@angular/router/src/utils/collection';
import { PickElementService } from '../services/pick-element.service';

@Directive({
	selector: '[app-playsentence]'
})
export class PlaysentenceDirective {

	constructor(private elmt: ElementRef, 
				private pms: PlaymediaService, 
				private op: OptionService, 
				private dl: DataloaderService,
				private pe: PickElementService) {
		this.compileSentence();
	}

	@HostListener('click', ['$event.target'])
	onClick(e) {
		//	If mouse event locked by feedback
		if(this.pe.mouseLock()) return;
		//console.log('Play sentence started for ' + e.attributes['data-ind'].value);
		if (!this.compiled && !this.play_busy) {
			this.compileSentence();

		}
		if (!this.sentence_played && (typeof this.silentPlay === 'undefined' || (typeof this.silentPlay !== 'undefined' && !this.silentPlay))) {
			this.removeWordMark();
			this.current_play = 0;
			this.play_busy = false;
			this.pms.stop();
			this.playWordsSequence();
		}
		//

	}

	public compiled: boolean = false;

	public play_busy: boolean = false;

	public sentence_played = false;

	//	Callback for finish
	public cb: any = null;
	public origin_text = '';
	public origin_proc_text = '';
	public words_audio = [];
	public end_callback: any = null;
	public reset_mark_timer: any = null;

	public innerWord = '';
	public word_translation: any = null;
	public trelm: any = null;
	public in_translation: boolean = false;
	public current_word: string = '';


	public items: any;

	@Input() silentPlay: boolean;

	compileSentence() {

		//	Get content of element which words must be playable
		let innerText = '';
		if (this.origin_text === '') {
			this.origin_text = this.elmt.nativeElement.innerHTML;
			// this.origin_text = 'mentally ill; insane;'

		}
		innerText = this.origin_text;


		//	Check if nothing in element then go back
		if (innerText === "") return;
		//	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
		//	RegExp find extra spaces
		let space_to_one = /[\s]+/g;
		//	RegExp to find punctuation characters
		let punctuation = /[\(\)\,\:\;\"\u2000-\u2060]/g;
		//	RegExp to find dots
		let dots = /\./g;
		//	RegExp to find slashes
		let slashes = /[\/\-\_\+]/g;
		//	RegExp for nonbreaking HTML space
		let nbsps = /(\&nbsp)+/ig;

		//	Convert plain words string to array
		let words_arr = [];
		//	Prepare buffer for words audio
		this.words_audio = [];

		this.compiled = true;
		let _wordarr = innerText.split(' ');


		//innerText = this.origin_text = this.elmt.nativeElement.innerHTML;
		innerText = innerText.replace(html, '').replace(space_to_one, ' ').replace(punctuation, '').replace(dots, ' ').replace(slashes, ' ').replace(nbsps, ' ');
		words_arr = innerText.split(' ');

		//	Find unique words in all words array
		for (let i in words_arr) {
			let w = words_arr[i].replace(/[\!\?]+/g, '');
			if (w !== '') {

				this.words_audio.push(w);

			}
		}

		//	Go throught all words and replace it with word HTML wrap
		//	Use string replace method without reg exp g key to replace only first match

		let proctext = this.origin_text;
		let customeHtml = '';
		let _html = '';
		let _words = []
		for (let i in this.words_audio) {
			let w = this.words_audio[i];
			if (/[\d]+/.test(w)) continue;
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
						_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + split_word[0] + '">' + split_word[0] + '<div>?</div></span>' + split_word[1];
					}
					if (wordExistenceCount == 1 && (word.replace('.', '') == w
						|| word.replace(',', '') == w || word.replace(':', ' ') == w
						|| word.replace('(', '') == w || word.replace('!', '') == w
						|| word.replace(')', '') == w || word.replace(';', '') == w)) {

						if (word.split(w).length > 1) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + '<div>?</div></span>' + word.split(w)[1];
							if (word.includes('(')) {
								_wordarr[index] = '' + '(' + '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + '<div>?</div></span>';
							}
						} else {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + ' <div>?</div></span>';
						}
						count = 1;
						return;
					}
					if (wordExistenceCount > 1 && word.replace('.', '') == w && count === 0) {
						const subwordExistenceCount = word.split('<span').length - 1;
						if (subwordExistenceCount == 0) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + ' <div>?</div></span>';
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
						_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + '</span>';
						return;
					}
					if (wordExistenceCount > 1 && word.replace('.', '') == w) {
						const subwordExistenceCount = word.split('<span').length - 1;
						if (subwordExistenceCount == 0) {
							_wordarr[index] = '<span data-click-ev-bound="false" class="translainable-word" data-wordpos="' + i + '" data-psword="' + w + '">' + w + '</span>';
							return;
						}

					}
				});
			}
		}
		proctext = _wordarr.join(' ');
		this.elmt.nativeElement.innerHTML = proctext;
		this.origin_proc_text = proctext;
		let that = this;
		setTimeout(() => {
			that.bindWordplayClickEvent();
		}, 10);

		this.sentence_played = false;
	}

	removeWordMark() {
		if (typeof this.items === 'undefined') return;
		this.items.forEach((el) => {
			el.style.backgroundColor = 'transparent';
		});
	}

	public marked_words = [];
	getMarkedQuantity(word) {
		let q = 0;
		for (let i in this.marked_words) {
			if (this.marked_words[i] === word) q++;
		}
		return q;
	}
	markTheWord() {
		if (typeof this.items === 'undefined') return;
		this.items.forEach((el) => {
			//
			if (+el.attributes['data-wordpos'].value === (this.current_play === 0 ? 0 : this.current_play - 1))
				el.style.backgroundColor = '#00ADEF';
			else
				el.style.backgroundColor = 'transparent';
		});
		return;
		/*
		//	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
		//	RegExp find extra spaces
		let space_to_one = /[\s]+/g;
		//	RegExp to find punctuation characters
		let punctuation = /[\,\:\;\"\-\(\)\u2000-\u2060]/g;
		//	RegExp to find dots
		let dots = /\./g;
		let wrr = this.origin_text.replace(html, '').replace(space_to_one, ' ').replace(punctuation, '').replace(dots, ' ').split(' ');
		let wr = [];
		for(let i in wrr){
			if(wrr[i] !== '') wr.push(wrr[i].replace(/[\!\?\.]/, ''));
		}
		
		let on = wr.slice(this.current_play - 1, this.current_play);
		let reg = new RegExp('\\b'+on[0]+'(?!\=)\\b');
		let nw = '';
		//	For the second and more time mark
		let n = this.getMarkedQuantity(on[0]);
		//	Prevent doublings
		if(n > 0){
			// (?<=[\w\s\W\S]*(cab){1}[\w\s\W\S]*)\bcab\b
			//reg = new RegExp('(?<=[\\w\\s\\W\\S]*('+on[0]+'){'+n+'}[\\w\\s\\W\\S]*)\\b'+on[0]+'(?!\=)\\b');

			//	Get index of required word
			let i = 0;
			let st = this.origin_text;
			for(let k = 0; k < n; k++) {
				//	Get first index in the string
				let j = st.search(reg);
				st = st.slice(j+on[0].length, st.length - 1);
				i += j+on[0].length;
			}

			//	Get before and after parts
			let bef = this.origin_text.slice(0, i);
			let aft = this.origin_text.slice(i, this.origin_text.length);

			//	Replace required word in after part with marked bg
			aft = aft.replace(reg, '<span class=\'playsentence-hilight\'>'+on[0]+'</span>');

			//	Get result row
			nw = bef + aft;

		} else {
			nw = this.origin_text.replace(reg, '<span class=\'playsentence-hilight\'>'+on[0]+'</span>');
		}
		
		
		this.marked_words.push(on[0]);
		this.elmt.nativeElement.innerHTML = nw;

		//	Start timer to remove mark
		let that = this;
		this.reset_mark_timer = setTimeout(()=>{
			that.removeWordMark();
		}, 1000);
		*/

	}

	public current_play = 0;
	playWordsSequence(cb = () => { }) {

		if (this.play_busy) return;
		this.play_busy = true;
		this.current_play = 0;
		this.marked_words = [];
		this.current_play++;
		this.markTheWord();
		let that = this;
		for (let i in this.words_audio) {
			let a = this.words_audio[i].replace("'", '');
			if (parseInt(i) === this.words_audio.length - 1) {
				this.pms.word(a, function () {
					that.removeWordMark();
					that.play_busy = false;
					//that.sentence_played = true;
					that.end();
					cb();
				}, 10);
			} else {
				this.pms.word(a, function () {
					that.current_play++;
					clearTimeout(that.reset_mark_timer);
					that.markTheWord();
				}, 10);
			}

		}

	}

	playSentenceByIndex(i, cb = () => { }) {

		if (!this.compiled && !this.play_busy) this.compileSentence();
		if (parseInt(this.elmt.nativeElement.attributes['data-ind'].value) === i) {
			//this.removeWordMark();
			this.playWordsSequence(cb);
		}
	}

	end() {
		if (this.end_callback !== null) this.end_callback();
	}

	stop() {
		this.pms.stop();
		this.play_busy = false;
	}


	resetWordBackground() {
		this.items.forEach((el) => {
			el.style.backgroundColor = 'transparent';
		});
	}


	//	Iterate via all playable words and bind to it click event
	//	to start play, also performs checking to prevent event double binding
	bindWordplayClickEvent() {

		let that = this;

		//	Iterate playable words
		let elms = this.items = this.elmt.nativeElement.querySelectorAll('span[data-psword]');
		for (let e in elms) {
			//	Get current playable word
			let pw = elms[e];
			//	Check if event is not binded yet
			if (typeof pw !== 'undefined' && typeof pw.attributes !== 'undefined' && pw.attributes["data-click-ev-bound"].value !== "true") {
				if (typeof this.silentPlay === 'undefined' || (typeof this.silentPlay !== 'undefined' && !this.silentPlay)) {
					//	Bind onclick event
					pw.onclick = function () {
						//	If mouse event locked by feedback
    					if(that.pe.mouseLock()) return;
						/*
						//	Get name of the file which must be played
						let an = pw.attributes['data-psword'].value;
						
						//	Mark clicked word and clear mark on rest of the words
						//angular.element('span[data-playw]').css('background-color', 'transparent');
						that.resetWordBackground();
						//pw.style.backgroundColor = '#00ADEF';
						that.pms.stop();
						that.pms.word(an, ()=>{});
						*/
					};

					//	Mark word as binded with onclick play event
					pw.setAttribute("data-click-ev-bound", "true");
				}

				//	Set click event for translation
				if (this.op.show_word_translation) {
					let tr = pw.querySelector('div');
					tr.addEventListener('click', (e) => {
						//	If mouse event locked by feedback
   						 if(that.pe.mouseLock()) return;
						that.clickToSeeTranslation.call(that, e);
					});
					tr.addEventListener('touchstart', (e) => {
						//	If mouse event locked by feedback
    					if(that.pe.mouseLock()) return;
						that.clickToSeeTranslation.call(that, e);
					});
				}

			}
		}

	}

	setTranslationPopup(content, word) {
		let that = this;
		document.querySelectorAll('.translate-popup-expanded').forEach((el) => {
			el.remove();
		});
		// Find root node for popup
		let rootclass = 'card-block-item';
		let rootn = null;
		let next_node = this.trelm.parentNode;
		for (let i = 0; i < 10; i++) {
			if (!next_node.classList.contains(rootclass)) {
				next_node = next_node.parentNode;
			} else {
				rootn = next_node;
				break;
			}
		}

		//	Create popup element
		let pp = document.createElement("div");
		pp.classList.add("translate-popup-init");
		setTimeout(() => { pp.classList.add("translate-popup-expanded"); }, 10);
		//setTimeout(()=>{ pp.innerText = content; }, 100);

		//	Create header
		let hh = document.createElement("h3");
		hh.innerText = word;
		pp.appendChild(hh);

		//	Create content
		let cn = document.createElement("span");
		cn.innerHTML = content;
		pp.appendChild(cn);

		pp.onclick = (e) => {
			//	If mouse event locked by feedback
			if(that.pe.mouseLock()) return;
			e.stopPropagation();
			e.preventDefault();
			pp.remove();
			document.querySelectorAll('.translate-popup-expanded').forEach((el) => {
				el.remove();
			});
		}
		rootn.appendChild(pp);

	}

	showTranslation(translation, word) {
		if (translation.length < 2) {
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
		document.querySelectorAll('.translate-popup-expanded').forEach((el) => {
			el.remove();
		});
		let that = this;
		this.in_translation = true;
		this.innerWord = e.target.parentNode.innerText.slice(0, -1);
		this.trelm = e.target;
		if (this.word_translation && this.current_word === this.innerWord) {
			setTimeout(() => {
				that.trelm.classList.add("translation-expand");
				setTimeout(() => {
					if (that.in_translation) {
						that.showTranslation(that.word_translation.translation, that.innerWord);
					}
				}, 200);
			}, 10);

		} else {
			that.trelm.innerText = ".";
			this.innerWord = e.target.parentNode.innerText.slice(0, -1);
			this.current_word = this.innerWord;
			if (this.innerWord === "") return;
			this.dl.getTranslation(this.innerWord).then((data) => {
				if (typeof data === 'undefined') return;
				that.word_translation = data;
				console.log(data);
				if (that.in_translation) {
					that.showTranslation(that.word_translation.translation, that.innerWord);
				}


			});
			console.log(this.innerWord);

			//  Change translation element to loading
			this.trelm.innerHTML = "";
			let load = document.createElement("span");
			load.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PGxpbmVhckdyYWRpZW50IGlkPSdGYXN0TG9hZGluZ0luZGljYXRvci1saW5lYXJHcmFkaWVudCcgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIHgxPScxLjc4MDQnIHkxPScxNi4wMzc5JyB4Mj0nMzAuMTQzOScgeTI9JzE2LjAzNzknPjxzdG9wIG9mZnNldD0nMC40MTY5JyBzdG9wLWNvbG9yPScjQ0RDRkQyJy8+PHN0b3Agb2Zmc2V0PScwLjkzNzYnIHN0b3AtY29sb3I9J3JnYmEoMjQ4LDI0OCwyNDksMCknLz48L2xpbmVhckdyYWRpZW50PjxjaXJjbGUgY3g9JzE2JyBjeT0nMTYnIHI9JzEyLjcnIHN0eWxlPSdmaWxsOiBub25lOyBzdHJva2U6IHVybCgjRmFzdExvYWRpbmdJbmRpY2F0b3ItbGluZWFyR3JhZGllbnQpOyBzdHJva2Utd2lkdGg6IDI7Jz48L2NpcmNsZT48L3N2Zz4=' alt='' style='' />";
			setTimeout(() => {
				that.trelm.classList.add("translation-expand");
			}, 20);
			setTimeout(() => {
				that.trelm.appendChild(load);
			}, 40);
		}

		//this.trelm.appendChild(load);

	}

	addPointerSign() {
		let that = this;
		let pointer = document.createElement("span");
		pointer.classList.add("translate-pointer");
		pointer.onclick = (e) => {
			//	If mouse event locked by feedback
			if(that.pe.mouseLock()) return;
			e.stopPropagation();
			e.preventDefault();
		}
		this.trelm.appendChild(pointer);
		setTimeout(() => { pointer.style.top = '60%'; }, 10);
	}


}
