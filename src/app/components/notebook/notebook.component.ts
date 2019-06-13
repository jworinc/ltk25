import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DataloaderService } from '../../services/dataloader.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { trigger, transition, animate, style, state } from '@angular/animations'

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
  public lesson_num = 0;
  @Input('show')
  set show(show: boolean) {
     this._show = show;
     //this.dataServiceSimulation();
     
    //  Get sight words list
    this.isNotebook = true;
    if(this._show){
      this.dl.getSightWords().subscribe((w)=>{
        console.log(w);
        if(this.data == undefined){
          this.data = w;
          this.card = w;
          this.isDescription = false;
          this.ind = 0;
          this.playWord();
        }
        
      });
    }

  }
  @Input('scale')
  set scsale(scale: number) {
     this._scale = scale;
     this.updateLayout();
  }

  constructor(private elm:ElementRef, 
              private sanitizer: DomSanitizer, 
              private playmedia: PlaymediaService, 
              private rw1cs: ColorschemeService,
              private dl: DataloaderService) {
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
      'transform': 'scale('+this._scale+', '+this._scale+')'
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

  enter(){
    console.log("I am enter");
    this.isNotebook = true;
    this.isDescription = false;
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
    }
  }

  showDescription(){
    //this.isDescription = !this.isDescription;
    this.playWord();
  }

  playWord(){
    this.playmedia.word(this.card[this.counter].wavename,function(){});
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

  }


}