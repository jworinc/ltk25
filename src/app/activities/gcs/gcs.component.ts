import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gcs',
  templateUrl: './gcs.component.html',
  styleUrls: ['./gcs.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GcsComponent extends BaseComponent implements OnInit {

    public word:any;
    public all_words : any;
    public ind : any;
    public next_word = 0;
    public count = 0;
    public instruct = {"content":[]};
    public respIfIncorrect = {"content":[]};
    public resp_incorrect = {"content":[{"instructions":[]}]} ;

    public isAnswered = false;
    public showAnswer = false;
    public isWrongLastAnswer = false;

    public isDisplay = true;

    public full_list = [];
    public current_fillup = 0;
    public expected_string = '';
    public input_data = '';
    public uinputph = 'question';

  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gcslog: LoggingService, private gcscs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, gcslog, gcscs);
    }

  	ngOnInit() {
      console.log(this.data);
      this.card = this.data;
      
      this.word = this.data['content'][this.next_word].parts[0].word.split('-');
      console.log(this.word);
      this.all_words = this.data['content'][this.next_word].parts;
      console.log(this.all_words);
      this.getFullListOfWords();
      this.removeDuplicates();

      this.getInstructions();

      
      //  Logging card object
      this.card_object = 'Word';
      //  Fill logging info
      this.card_instance = this.word.toString().replace(',','');
      this.expected_string = this.word.toString().replace(',','');
      this.uinputph = 'question';

    }

    getFullListOfWords() {
      for(let i in this.card.content) {
        let c = this.card.content[i];
        for(let p in c.parts){
          this.full_list.push(c.parts[p]);
        }
      }
    }

    removeDuplicates(){
      if(this.current_fillup >= this.full_list.length) this.current_fillup = 0;
    
      let exist = [];
      for(let i=0;i<this.all_words.length;i++){
        if(exist.indexOf(this.all_words[i].word.split('-')[1]) >= 0) {
          //  Try find replace word to change dublicate
          while(exist.indexOf(this.full_list[this.current_fillup].word.split('-')[1]) >= 0){
            this.current_fillup++;
            if(this.current_fillup >= this.full_list.length) return;
          } 
          this.all_words[i] = this.full_list[this.current_fillup];
        }
        
        exist.push(this.all_words[i].word.split('-')[1]);
        
      }

    }
    

    checkAnswer(answer,i){

      this.ind = i;
      this.next_word++;
      let that = this;
      let a = answer.split('-');
      if(a.length > 1) this.input_data = a[1];
      if(this.word.toString().replace(',','') == answer.replace('-','')){
        
        this.showAnswer = true;
        
        this.count++;

        if(this.next_word < this.data['content'].length){
          this.card.content[0].instructions = [];
          for(let i=0; i<this.instruct.content.length;i++){
            this.card.content[0].instructions.push(this.instruct.content[i]);
          }
          this.playmedia.action('CHIMES', function(){
            that.playmedia.word(answer.replace('-',''), ()=>{
              that.playCardDescription();
              
              setTimeout(()=>{
  
                that.word = that.data['content'][that.next_word].parts[0].word.split('-');
                console.log(that.word);
                that.all_words = that.data['content'][that.next_word].parts;
                that.removeDuplicates();
                that.all_words = that.shuffle(that.all_words);
                that.ind = -1;
                that.isAnswered = false;
                that.showAnswer = false;

                
                //  Fill logging info
                that.card_instance = that.word.toString().replace(',','');
                that.expected_string = that.word.toString().replace(',','');
                that.current_presented++;


              },2000);
              
            }, 100);
          }, 30);
          
        }else{
          
          this.playmedia.action('CHIMES', function(){
            that.playmedia.word(answer.replace('-',''), ()=>{
              that.isDisplay = false;
              that.afterComplete();
            }, 100);
          }, 30);
        }
        

      }else{

        this.showAnswer = true;
        this.isWrongLastAnswer = true;

        //  Logging error
        this.result();

        this.playmedia.action('DING', function(){
          
            that.playCardDescription();
          
        }, 30);

        for(let i=0; i<this.respIfIncorrect.content.length;i++){
          this.resp_incorrect.content[0].instructions[i]=this.respIfIncorrect.content[i];
        }

        this.isAnswered = true;
        this.card.content[0].instructions = this.resp_incorrect.content[0].instructions;
          
      }
    }


    getInstructions(){

      console.log("I am called");

      let temp = {};

      for(let i=0; i<this.data['content'][0]['LoopInst'].length; i++){
        temp = { "audio":this.data['content'][0]['LoopInst'][i].audio ,"pointer_to_value":this.data['content'][0]['LoopInst'][i].pointer_to_value}
        this.instruct.content.push(temp);
      }

      for(let i=0; i<this.data['content'][0]['RespIfIncorrect'].length; i++){
        temp = { "audio":this.data['content'][0]['RespIfIncorrect'][i].audio ,"pointer_to_value":this.data['content'][0]['RespIfIncorrect'][i].pointer_to_value}
        this.respIfIncorrect.content.push(temp);
      }

      for(let i=0; i<this.instruct.content.length;i++){
        this.card.content[0].instructions.push(this.instruct.content[i]);
      }

      console.log(this.instruct.content);
      //this.playCardDescription();

    }


    playContentDescription(){
      let that = this;
      if(this.isWrongLastAnswer){
        that.playmedia.word(this.word.toString().replace(',',''), ()=>{
          that.playContentDescription();
        }, 100);
        this.isWrongLastAnswer = false;
        return;
      }
      if(this.isAnswered){
        if(this.next_word < this.data['content'].length ){

          this.card.content[0].instructions = [];
          for(let i=0; i<this.instruct.content.length;i++){
            this.card.content[0].instructions.push(this.instruct.content[i]);
          }
          this.playCardDescription();

          this.word = this.data['content'][this.next_word].parts[0].word.split('-');
          console.log(this.word);
          this.all_words = this.data['content'][this.next_word].parts;
          this.removeDuplicates();
          this.all_words = this.shuffle(this.all_words);
          this.ind = -1;
          this.isAnswered = false;
          this.showAnswer = false;

          //  Fill logging info
          that.card_instance = that.word.toString().replace(',','');
          that.expected_string = that.word.toString().replace(',','');
          that.current_presented++;

        }else{
          this.isAnswered = false;
          this.isDisplay = false;
          this.afterComplete();
        }

      }


    }

    afterComplete(){
          let temp = {};
          this.card.content[0].instructions = [];
          for(let i=0; i<this.data['content'][0]['RespAtEnd'].length; i++){
            temp = { "audio":this.data['content'][0]['RespAtEnd'][i].audio ,"pointer_to_value":this.data['content'][0]['RespAtEnd'][i].pointer_to_value}
            this.card.content[0].instructions.push(temp);
          }

          this.playCardDescription();
    }

    //	Shuffles array in place.
    shuffle(a) {
        let j, x, i;
        let out = [];
        for(let k in a)
          out.push(a[k]);
        for (i = out.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = out[i];
            out[i] = out[j];
            out[j] = x;
        }
        return out;
    }

    
    //	Callback for show card event
    show() {
      //	If card is active and it is not dubling
      if(this.isActive() && !this.prevent_dubling_flag){
        //	If user not enter valid data yet
        if(!this.validate()) {
          
          //	Play card description
          //this.playContentDescription();
          this.playCardDescription();
          this.disableMoveNext();
          
        } else {
          this.enableMoveNext();
        }
        this.prevent_dubling_flag = true;
      }
      
    }

    
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

    //	Enter click handler
    enter() {
      if(this.uinputph === 'finish'){
        //this.playCorrectSound();
        this.enableNextCard();
      } else {
        //playmedia.sound('_STNQR', function(){});
      }
    }



}
