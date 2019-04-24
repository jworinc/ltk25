import { Component, OnInit, Input, ElementRef, ViewChild, DoCheck  } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { ColorschemeService } from '../../services/colorscheme.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['./gnb.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GnbComponent extends BaseComponent implements OnInit {

    @ViewChild(PlaysentenceDirective) psn;
  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gnblog: LoggingService, private gnbcs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, gnblog, gnbcs);
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
      this.card_object = 'Sound';
      //this.setBlends();
      this.getExistingBlends();
      this.presentWord();
    }
  
  
    //	Set header for current card
    public current_header = '';
    
    //	User answer phases, rec, listen, compare, split to syllables, finish
    public uinputph = 'rec';
  
    public input_data = '';
  
    public blends = [];
    public blends_origin = [];
    public randomel = [];
    public answers = [];
    public answer_to_display = [];
    public audios = [];
    public expected = [];
    public display_result: any;
    public words_collection = [];
  
    //	Define current card number
    public current_number = 0;
    public card_id = 0;
    
    public current_set = 0;
    public expected_string: any;
    public current_blend: any;
    
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
          this.playCardDescription();
          this.disableMoveNext();
          
        } else {
          this.enableMoveNext();
        }
        this.prevent_dubling_flag = true;
      }
      
    }
  
    hide() {
      this.prevent_dubling_flag = false;
      //	Hide option buttons
      this.optionHide();
    }
  
    setFocus(){
      
    };
  
    //	Used to play task word and sound exactly after instructions play finished
    playContentDescription() {
  
      this.playmedia.word(this.current_blend.wavename, function(){}, 300);
      //this.presentWord();

    }
    
    addAnswer(ind) {
  
      this.input_data = this.blends[ind];
  
      //	If we didn't store user answer for current word, remember it
      if(this.answers.length < this.expected.length){
        this.answers.push(this.blends[ind]);
        //	If user input wrong save first result for current word
        if(this.blends[ind] !== this.expected_string){
          this.display_result.wrong++;
        } else {
          this.display_result.right++;
        }
      }
  
      //	If user input wrong
      if(this.blends[ind] !== this.expected_string){
        //	Save error to log
        this.result();
        //	Play wrong action sound
        this.playmedia.action('DING', function(){}, 30);
        return;
      }
  
      //	Otherwice show right answer and next set of words
      this.answer_to_display.push(this.blends[ind]);
      //	Restrict quantity of displayed words to max 4
      if(this.answer_to_display.length > 6) this.answer_to_display.shift();
      //this.getBlends();
      this.blends_origin = this.shuffle(this.blends_origin);
      this.presentWord();
      if(this.uinputph !== 'finish' && this.uinputph !== 'complete') this.playContentDescription();
    }
  
    showResults(){
      
      this.elm.nativeElement.querySelector('.gsc-letters').style.display = 'none';
      this.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';
      let that = this;
      that.uinputph = 'complete';
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
  
    presentWord() {
      let that = this;
      if(this.words_collection.length > 0){
        this.current_blend = this.words_collection.shift();
        this.card_instance = this.current_blend.parts.join('');
        this.expected_string = this.current_blend.blend.substr(2, 2).toUpperCase();
        this.expected.push(this.expected_string);
        this.blends = this.blends_origin.slice(0, 4);
        if(this.blends.indexOf(this.expected_string) < 0){
          this.blends.shift(); this.blends.push(this.expected_string);
        }
        //this.playmedia.word(this.current_blend.wavename, function(){
        that.current_presented++;
        //}, 300);
      } else {
        that.current_presented--;
        this.showResults();
      }
      
    }
  
    getExistingBlends() {
      this.blends_origin = [];
      //  Go throught all words and select unique blends
      for(let i in this.card.content){
        let c = this.card.content[i];
        let b = c.blend.substr(2, 2).toUpperCase();
        if(this.blends_origin.indexOf(b) < 0) this.blends_origin.push(b);
        this.words_collection.push(c);
      }
    }

    //  Shuffles array in place.
    shuffle(a) {
      let j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
    }
  
  
  
  }