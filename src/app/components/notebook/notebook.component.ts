import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DataloaderService } from '../../services/dataloader.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { PickElementService } from '../../services/pick-element.service';

@Component({
	selector: 'app-notebook',
	templateUrl: './notebook.component.html',
	styleUrls: ['./notebook.component.scss'],
	host: {'class': 'notebook-wrapper-slide'},
	animations:[trigger('slideleft', [
		state('flyIn', style({ transform: 'translateX(0)',overflow:'hidden' })),
		transition(':enter', [
			style({ transform: 'translateX(-100%)' }),
			animate('0.2s 100ms ease-in')
		]),
		// transition(':leave', [
		//   animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
		// ])
	]),

	trigger('slideright', [
		state('flyIn', style({ transform: 'translateX(0)',overflow:'hidden' })),
		transition(':enter', [
			style({ transform: 'translateX(100%)' }),
			animate('0.2s 100ms ease-in')
		]),
		// transition(':leave', [
		//   animate('0.3s ease-out', style({ transform: 'translateX(-100%)' }))
		// ])
	]),

	trigger('fadeInOut', [
		state('void', style({
			opacity: 0
		})),
		transition('void <=> *', animate(1000)),
	])

	]
	
})
export class NotebookComponent implements OnInit {

	public isNotebook:boolean = true;
	public isDescription:boolean = false;
	public word_data:any;
	//public show_word:string = "";
	public ind = 0 ;
	//public desc="";
	public data: any;
	public _show: any;
	public _scale: number;
	public nblayout: any;
	public move = true;
	public card: any;
	public searchText: any;
	public searched_text: any;
	public lesson_num = 0;
	public show_notebook = true;
	public talking_notepad_show = false;
	public words_subscription: any = null;

	@Input('show')
	set show(show: boolean) {
		 this._show = show;
		 //this.dataServiceSimulation();
		 
		//  Get sight words list
		this.isNotebook = true;
		if(this._show){
			this.words_subscription = this.dl.getSightWords().subscribe((w)=>{
				console.log(w);
				if(this.data == undefined){
					this.data = w;
					this.card = w;
					this.isDescription = false;
					this.ind = 0;
					this.playWord();
				}
				
			});
		} else {
			if(this.words_subscription && typeof this.words_subscription.unsubscribe !== 'undefined')
				this.words_subscription.unsubscribe();
		}

	}
	@Input('scale')
	set scsale(scale: number) {
		 this._scale = scale;
		 this.updateLayout();
	}

	@Output() closenotebook = new EventEmitter<boolean>();

	constructor(private elm:ElementRef, 
							private sanitizer: DomSanitizer, 
							private playmedia: PlaymediaService, 
							private rw1cs: ColorschemeService,
							private dl: DataloaderService,
							private pe: PickElementService) {
		//super(elm, sanitizer, playmedia, rw1cs);
	}

	ngOnInit() {
		console.log("I am in component notebook ngonit...");
		console.log(this.data);
		console.log(this.lesson_num);
	}

	//  This method will be replaced later with real data service API
	dataServiceSimulation() {
		let data = { "type": 'notebook', "nb_words":[{"word":"Word1","desc":"This is word1"},{"word":"Word2","desc":"This is word2"},{"word":"Word3","desc":"This is word3"},{"word":"Word4","desc":"This is word4"}]};
		this.data = data;
	}

	updateLayout(){
		this.nblayout = {
			'transform': 'scale('+(this._scale)+', '+(this._scale-0.15)+')'
		}
	}
	getDetails(i){
		this.isNotebook = false;
		// // this.show_word = this.data[i].title;;
		// // this.desc = this.data[i].definition;
		// this.word_data = this.data[i];
		//this.ind = i;
		this.counter = i;
		this.playWord();
	}
	// searched_text='';
	// searchText='';
	enter(){
		console.log("I am enter");
		this.isNotebook = true;
		this.isDescription = false;
		this.searched_text = this.searchText;
	}
	counter = 0;
	showNextWord(){
		this.move = true;
		console.log(this.ind);
		if(this.ind != this.card.length-1){
			// this.ind++;
			// console.log(this.ind);
			// // this.show_word = this.data[this.ind].title;
			// // this.desc = this.data[this.ind].definition;
			// this.word_data = this.data[this.ind];
			this.counter += 1;
			this.isDescription = false;
			this.playWord();
			if(document.getElementById('notebook-words'))
				document.getElementById('notebook-words').scrollTop = document.getElementById('scroll-to-'+this.counter).offsetTop-120;
			if(document.getElementById('notebook-words1'))
				document.getElementById('notebook-words1').scrollTop = document.getElementById('scroll1-to-'+this.counter).offsetTop-120;
		}
	}

	showPrevWord(){
		this.move = false;

		// if(this.ind != 0){
		//   this.ind--;
		//   // this.show_word = this.data[this.ind].title;
		//   // this.desc = this.data[this.ind].definition;
		//   this.word_data = this.data[this.ind];
		//   this.isDescription = false;
		//   this.playWord();
		// }

		if (this.counter >= 1) {
			this.counter = this.counter - 1;
			this.isDescription = false;
			this.playWord();
			if(document.getElementById('notebook-words'))
				document.getElementById('notebook-words').scrollTop = document.getElementById('scroll-to-'+this.counter).offsetTop-120;
			if(document.getElementById('notebook-words1'))
				document.getElementById('notebook-words1').scrollTop = document.getElementById('scroll1-to-'+this.counter).offsetTop-120;
		}
	}

	showDescription(){
		//this.isDescription = !this.isDescription;
		this.playWord();
	}

	playWord(){
		this.playmedia.stop();
		if(typeof this.card !== 'undefined' && this.card.length > 0) {
			this.playmedia.word(this.card[this.counter].wavename,function(){});
			document.getElementById("notebook-title").innerHTML = this.card[this.counter].title.charAt(0).toUpperCase() + this.card[this.counter].title.slice(1);
			document.getElementById("notebook-title1").innerHTML = this.card[this.counter].title.charAt(0).toUpperCase() + this.card[this.counter].title.slice(1);
		}
	}

	public search_val = 0;
	changingValue(){
		console.log("I am called "+this.lesson_num);
		this.card = [];
		if(this.search_val == 1){
			
			for(let i=0; i<this.data.length; i++){
				if( this.data[i].lesson < this.lesson_num){
					this.card.push(this.data[i]);
				}
			}
			
		}else if(this.search_val == 2){

			for(let i=0; i<this.data.length; i++){
				if( this.data[i].lesson == this.lesson_num){
					this.card.push(this.data[i]);
				}
			}

		}else if(this.search_val == 3){

			for(let i=0; i<this.data.length; i++){
				if( this.data[i].mistake == 1){
					this.card.push(this.data[i]);
				}
			}
			
		}else{
			this.card = this.data;
		}
		this.counter=0;
		this.playWord();
	}
	serchText(search_text){
		console.log("I am called "+search_text);
		this.card = [];
		if(search_text !== "")
		{
			for(let i=0; i<this.data.length; i++)
			{
				if( this.data[i].title.includes(search_text))
				{
					this.card.push(this.data[i]);
				}
			}
		}
		else
		{
			this.card = this.data;
		}
		this.searchText=search_text;
		this.counter=0;
		this.playWord();
	}

	
	onCloseBack() {
		//	If mouse event locked by feedback
		if(this.pe.mouseLock()) return;
		this.closenotebook.emit();
	}

	onShowNotepad() {
		this.playmedia.stop();
		this.show_notebook = false;
		this.talking_notepad_show = true;
	  }
	  onShowNotebook() {
		this.talking_notepad_show = false;
		this.show_notebook = true;
	  }
}