import { Directive, ElementRef, HostListener, HostBinding } from '@angular/core';
import { PlaymediaService } from '../services/playmedia.service';

@Directive({
  selector: '[app-playsentence]'
})
export class PlaysentenceDirective {

	constructor(private elmt: ElementRef, private pms: PlaymediaService) { 
	  	this.compileSentence();
	}

	@HostListener('click', ['$event.target'])
	onClick(e) {
	    console.log('Play sentence started for ' + e.attributes['data-ind'].value);
	    if(!this.compiled && !this.play_busy) this.compileSentence();
		this.removeWordMark();
		this.current_play = 0;
		this.play_busy = false;
		this.pms.stop();
		this.playWordsSequence();
	}	

	public compiled: boolean = false;

	public play_busy: boolean = false;

	//	Callback for finish
	public cb: any = null;
	public origin_text = '';
	public words_audio = [];
	public end_callback: any = null;
	public reset_mark_timer: any = null;

	compileSentence(){

		//	Get content of element which words must be playable
		let innerText = this.origin_text = this.elmt.nativeElement.innerHTML;
		//	Check if nothing in element then go back
		if(innerText === "") return;
		//	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
		//	RegExp find extra spaces
		let space_to_one = /[\s]+/g;
		//	RegExp to find punctuation characters
		let punctuation = /[\,\:\;\"\'\u2000-\u2060]/g;
		//	RegExp to find dots
		let dots = /\./g;

		//	Convert plain words string to array
		let words_arr = [];
		//	Prepare buffer for words audio
		this.words_audio = [];

		this.compiled = true;


		innerText = this.origin_text = this.elmt.nativeElement.innerHTML;
		innerText = innerText.replace(html, '').replace(space_to_one, ' ').replace(punctuation, '').replace(dots, ' ');
		words_arr = innerText.split(' ');
    	
		//	Find unique words in all words array
		for(let i in words_arr)	{
			let w = words_arr[i].replace(/[\!\?]+/g, '');
			if(w !== ''){
				
				this.words_audio.push(w);
				
			}
		}
	}

	removeWordMark(){
		this.elmt.nativeElement.innerHTML = this.origin_text;
	}

	public marked_words = [];
	getMarkedQuantity(word){
		let q = 0;
		for(let i in this.marked_words){
			if(this.marked_words[i] === word) q++;
		}
		return q;
	}
	markTheWord(){
		//	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
		//	RegExp find extra spaces
		let space_to_one = /[\s]+/g;
		//	RegExp to find punctuation characters
		let punctuation = /[\,\:\;\"\-\u2000-\u2060]/g;
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

	}

	public current_play = 0;
	playWordsSequence(cb=()=>{}) {
		
		if(this.play_busy) return;
		this.play_busy = true;
		this.current_play = 0;
		this.marked_words = [];
		this.current_play++;
		this.markTheWord();
		let that = this;
		for(let i in this.words_audio){
			let a = this.words_audio[i];
			if(parseInt(i) === this.words_audio.length - 1){
				this.pms.word(a, function(){
					that.removeWordMark();
					that.play_busy = false;
					that.end();
					cb();
				}, 10);
			} else {
				this.pms.word(a, function(){
					that.current_play++;
					clearTimeout(that.reset_mark_timer);
					that.markTheWord();
				}, 10);
			}
			
		}
		
	}

	playSentenceByIndex(i, cb=()=>{}) {

		if(!this.compiled && !this.play_busy) this.compileSentence();
		if(parseInt(this.elmt.nativeElement.attributes['data-ind'].value) === i){
			this.removeWordMark();
			this.playWordsSequence(cb);
		}
	}
	
	end() {
		if(this.end_callback !== null) this.end_callback();
	}

	stop() {
		this.pms.stop();
		this.play_busy = false;
	}


}
