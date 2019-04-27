import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-rw1',
  templateUrl: './rw1.component.html',
  styleUrls: ['./rw1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Rw1Component extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private rw1log: LoggingService, private rw1cs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, rw1log, rw1cs);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
    this.card = this.data;
    this.showTranslation = false;
    this.eventStatus = false;
    console.log(this.data);
    this.current_header = this.card.header;
    let that = this;
    setTimeout(()=>{ 
      that.updateWordblocks(); 
      that.updateViewStates();
      that.elm.nativeElement.querySelectorAll('.word-block').forEach((e)=>{
        e.style.opacity = '1';
      });
    }, 10);
    this.wblength = this.card.content.length;
    this.initViewStates();

    //  Mark words in sample sentences with the bold font
    for(let i in this.card.content){
      let c = this.card.content[i];
      if(typeof c.content[0].sentence !== 'undefined'){
        let wr = c.title;
        let wr1 = wr.substring(wr.length-2, wr.length) === 'es' ? wr.substring(0, wr.length - 2) : wr.substring(wr.length-1, wr.length) === 's' ? wr.substring(0, wr.length-1) : '';
        let wg = new RegExp('\\b'+wr+'\\b', 'i');
        let wg1 = new RegExp('\\b'+wr1+'\\b', 'i');
        if(wg.test(c.content[0].sentence))
          c.content[0].sentence = c.content[0].sentence.replace(wg, '<b>'+wr+'</b>');
        else if(wg1.test(c.content[0].sentence))
          c.content[0].sentence = c.content[0].sentence.replace(wg1, '<b>'+wr1+'</b>');
      }
    }

  }
  
  public current_number: any;
  public card_id: any;
  public current_header: any;
  public wblength: number = 0;
  public showTranslation:any;
  public eventStatus:any;
  //  Current word
  public cw: number = 0;

  //  Word blocks view states, (word | pronounce | sentence)
  public wbvs = [];

  //  Init Word blocks view states
  initViewStates() {
    for(let i = 0; i < this.wblength; i++){
      this.wbvs.push({view: 'word'});
    }
  }

  //  Update word blocks view states
  updateViewStates() {
    let that = this;
    //  Go over all wordblocks elements and calc vertical view position
    this.elm.nativeElement.querySelectorAll('.word-block').forEach(element => {
      //  Get width of word block
      let h = element.clientWidth + 25;
      //  Get position in word blocks list
      let p = +element.attributes.wordindex.value;
      //  Get current view
      let v = that.wbvs[p].view;
      //  Define phisical position on card in pixels
      if(v === 'word'){
        //  Define word view
        element.querySelector('.word-box').style.left='0';
        element.querySelector('.phoneme-box').style.left=h+'px';
        element.querySelector('.sentence-box').style.left=h+'px';
        element.querySelector('.word-box').style.opacity='1';
        element.querySelector('.phoneme-box').style.opacity='0';
        element.querySelector('.sentence-box').style.opacity='0';
      }
      else if(v === 'pronounce'){
        //  Define pronounce view
        element.querySelector('.word-box').style.left=((-1)*h)+'px';
        element.querySelector('.phoneme-box').style.left='0';
        element.querySelector('.sentence-box').style.left=h+'px';
        element.querySelector('.word-box').style.opacity='0';
        element.querySelector('.phoneme-box').style.opacity='1';
        element.querySelector('.sentence-box').style.opacity='0';
      } else {
        //  Define sample sentence
        element.querySelector('.word-box').style.left=((-1)*h)+'px';
        element.querySelector('.phoneme-box').style.left=((-1)*h)+'px';
        element.querySelector('.sentence-box').style.left='0';
        element.querySelector('.word-box').style.opacity='0';
        element.querySelector('.phoneme-box').style.opacity='0';
        element.querySelector('.sentence-box').style.opacity='1';
      }
    });

  }

  showTranslationStatus(e)
  {
    if(this.showTranslation)
      this.showTranslation = false;
    else
      this.showTranslation = true;
  }
  
  //  Update word blocks position according to current word
  updateWordblocks(){
    
    let that = this;

    //  Go over all wordblocks elements and calc position
    this.elm.nativeElement.querySelectorAll('.word-block').forEach(element => {
      //  Get width of word block
      let w = element.clientWidth*2;
      //  Get position in word blocks list
      let p = +element.attributes.wordindex.value;
      //  Define phisical position on card in pixels
      if(p === that.cw){
        //  Define current word block position
        element.style.left = '0px';
      }
      else if(p > that.cw){
        //  Define before current word blocks position
        element.style.left = w+'px';
      } else {
        //  Define after current word blocks position
        element.style.left = ((-1)*w)+'px';
      }
    });

  }

  //  Click event handler, go to the next word block
  showNextWord() {

    //  Stop play audios
    this.playmedia.stop();

    //  Check current word view state
    let vs = this.wbvs[this.cw];

    //  When reach sentence view, we can move to the next wordblock
    if(vs.view === 'sentence'){
      //  Max word blocks
      let m = this.wblength;
      this.cw++;
      //  Check overhead
      if(this.cw >= m) this.cw = m-1;
      //  Update word blocks
      this.updateWordblocks();
    }
    //  Else switch to the next view
    else {
      this.showNextView();
    }

    
  }

  //  Click event handler, go to the prev word block
  showPrevWord() {

    //  Stop play audios
    this.playmedia.stop();

    //  Check current word view state
    let vs = this.wbvs[this.cw];

    //  When reach word view, we can move to the prev wordblock
    if(vs.view === 'word'){
      this.cw--;
      //  Check overhead
      if(this.cw < 0) this.cw = 0;
      //  Update word blocks
      this.updateWordblocks();
    }
    //  Else switch to the prev view
    else {
      this.showPrevView();
    }

  }

  //  Click event handler, down view
  showNextView() {
    let cw = this.cw;
    //  Check current view state and switch down
    if(this.wbvs[cw].view === 'word') this.wbvs[cw].view = 'pronounce';
    else if(this.wbvs[cw].view === 'pronounce') this.wbvs[cw].view = 'sentence';
    this.updateViewStates();
  }

  //  Click event handler, up view
  showPrevView(){
    let cw = this.cw;
    //  Check current view state and switch up
    if(this.wbvs[cw].view === 'sentence') this.wbvs[cw].view = 'pronounce';
    else if(this.wbvs[cw].view === 'pronounce') this.wbvs[cw].view = 'word';
    this.updateViewStates();
  }

  //  Play word
  playWord(name) {
    this.playmedia.stop();
    this.playmedia.word(name, ()=>{});
  }

  public pronounce_play_sequence_started: boolean = false;
  public pronounce_play_counter: number = 0;
  public mask_syl_pos = [];

  playPronounce(id) {
    this.playmedia.stop();
    this.elm.nativeElement.querySelectorAll('.phoneme-syllable span').forEach((e)=>{
      e.style.backgroundColor = 'transparent';
    });
    this.mask_syl_pos = [];
    let c = this.card.content[this.cw];
    if(c.pronounce !== ""){
      this.pronounce_play_counter = 0;
      let cp = c.pronounce.split("-");
      let that = this;
      //	Create audio objects for each syllable
      for(let i in cp){
        let phs = cp[i];
        let ph = phs.split(",");
        for(let k in ph){
          let sl = ph[k];
          if(sl === '') continue;
          sl = '_S'+sl.toUpperCase();
          this.playmedia.sound(sl, ()=>{
            that.pronounce_play_counter++;
            if(that.pronounce_play_counter > that.mask_syl_pos.length) that.pronounce_play_counter = that.mask_syl_pos.length;
            if(that.pronounce_play_counter > that.mask_syl_pos.length-1){
              that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
                e.style.backgroundColor = 'transparent';
              });
            } else {
              let s = that.mask_syl_pos[that.pronounce_play_counter];
              that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
                e.style.backgroundColor = 'transparent';
              });
              that.elm.nativeElement.querySelector('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span[playsyl=\''+s.syl+'\'][playpos=\''+s.pos+'\']')
                .style.backgroundColor = 'yellow';
            }
            
          }, 300);
          this.mask_syl_pos.push({syl: i, pos: k});
        }
      }
      let ss = that.mask_syl_pos[that.pronounce_play_counter];
      that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
        e.style.backgroundColor = 'transparent';
      });
      that.elm.nativeElement.querySelector('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span[playsyl=\''+ss.syl+'\'][playpos=\''+ss.pos+'\']')
        .style.backgroundColor = 'yellow';
      
    }
  } 

}