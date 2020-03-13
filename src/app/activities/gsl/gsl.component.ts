import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { Observable } from 'rxjs';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gsl',
  templateUrl: './gsl.component.html',
  styleUrls: ['./gsl.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GslComponent extends BaseComponent implements OnInit {

  @ViewChild('focus') private elementRef: ElementRef;

    public instruct = {"content":[]};
    public temp_word:any;
    public ind = 0;
    public entered_val = "";
    public count = 0;
    public isAnswered = false;
    public isWrong = false;
    public answered = [];

    public respIfIncorrect = {"content":[]};
    public respAtEnd = {"content":[]};
    public tem_instr = {"content":[{"instructions":[]}]} ;
    public corrected_answer = "";
    public input_data: any;
    public expected_string: any;
    public uinputph = 'start';
    public move_next_timer: any = null;

  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gsllog: LoggingService, private gslcs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, gsllog, gslcs);
    }


    ngOnInit() {
      console.log(this.data);
      this.card = this.data;

      this.temp_word = this.data['content'][0].parts.join('').replace(/-/g,'');
      console.log(this.temp_word);
      this.getInstructions();

      //   Logging object
      this.card_object = 'Sound';

      //  Fill logging info
      this.card_instance = this.temp_word;
      this.expected_string = this.data['content'][0].silent;
      this.uinputph = 'question';
    }

    getInstructions(){

      console.log("I am called");

      let temp = {};

      for(let i=0; i<this.data['content'][0]['Instructions'].length; i++){
        temp = { "audio":this.data['content'][0]['Instructions'][i].audio ,"pointer_to_value":this.data['content'][0]['Instructions'][i].pointer_to_value}
        this.instruct.content.push(temp);
      }
      for(let i=0; i<this.data['content'][0]['LoopInst'].length; i++){
        temp = { "audio":this.data['content'][0]['LoopInst'][i].audio ,"pointer_to_value":this.data['content'][0]['LoopInst'][i].pointer_to_value}
        this.instruct.content.push(temp);
      }

      for(let i=0; i<this.data['content'][0]['RespIfIncorrect'].length; i++){
        temp = { "audio":this.data['content'][0]['RespIfIncorrect'][i].audio ,"pointer_to_value":this.data['content'][0]['RespIfIncorrect'][i].pointer_to_value}
        this.respIfIncorrect.content.push(temp);
      }

      // for(let i=0; i<this.respIfIncorrect.content.length;i++){
      //   this.tem_instr.content[0].instructions.push(this.respIfIncorrect.content[i]);
      // }

      // this.tem_instr.content[0].instructions[this.tem_instr.content[0].instructions.length] = this.instruct.content[this.instruct.content.length-1];

      for(let i=0; i<this.instruct.content.length;i++){
        if(i != 0)
        this.card.content[0].instructions.push(this.instruct.content[i]);
      }

      console.log(this.card);
      //this.playCardDescription();

    }

    playContentDescription(){
      
      if(this.uinputph === 'finish') {
        this.enableNextCard();
        let that = this;
        this.move_next_timer = setTimeout(()=>{
          that.enableMoveNext();
          that.moveNext();
        }, 1000);
        return;
      }

      if( this.data.content.length != this.answered.length)
      this.nextWord();

    }

    nextWord(){
    //  this.card.content[0].desc = this.temp_word;

    if(this.corrected_answer !=""){
      this.playmedia.word(this.corrected_answer, function(){
      });

      //this.card.content[0].instructions.push(this.instruct.content[this.instruct.content.length-1]);

    }else{
      this.playmedia.word(this.temp_word, function(){
      });
    }

      if(!this.isWrong)
      this.isAnswered = false;

      //this.isWrong = false;


      this.elementRef.nativeElement.focus();

    }
 
    checkAnswer(){
  
        if(this.ind < this.data['content'].length){
          if(this.entered_val.trim() != ""){
            if(this.entered_val == this.data['content'][this.ind].silent){
              this.corrected_answer = "";
              this.isWrong = false;

              if(!this.isAnswered){
                this.count++;
                console.log("Count : "+this.count);
              }

              this.playmedia.action('CHIMES', function(){}, 30);
              this.ind++;
              this.answered.push(this.temp_word);
              if(this.ind< this.data['content'].length){
                this.temp_word = this.data['content'][this.ind].parts.join('').replace(/-/g,'');
                //  Fill logging info
                this.card_instance = this.temp_word;
                this.expected_string = this.data['content'][this.ind].silent;
                this.current_presented++;
                console.log(this.temp_word);
                //this.nextWord();
                this.card.content[0].instructions = [];
                this.card.content[0].instructions[0] = this.instruct.content[this.instruct.content.length-1];
                this.playCardDescription();
              }else{

                this.tem_instr.content[0].instructions = [];

                for(let i=0; i<this.data['content'][0]['RespAtEnd'].length; i++){
                  let temp = { "audio":this.data['content'][0]['RespAtEnd'][i].audio ,"pointer_to_value":this.data['content'][0]['RespAtEnd'][i].pointer_to_value}
                  this.respAtEnd.content.push(temp);
                }

                for(let i=0; i<this.respAtEnd.content.length;i++){
                  this.tem_instr.content[0].instructions.push(this.respAtEnd.content[i]);
                }


                this.card.content[0].instructions = this.tem_instr.content[0].instructions;
                
                this.uinputph = 'finish';
                this.playCardDescription();
              }



            }else{

              this.corrected_answer = this.data['content'][this.ind].silent;
              for(let i=0; i<this.respIfIncorrect.content.length;i++){
                this.tem_instr.content[0].instructions[i]=this.respIfIncorrect.content[i];
              }
              console.log("ELSEELSEELSE")
              console.log(this.tem_instr);
              this.card.content[0].instructions = this.tem_instr.content[0].instructions;
              this.playCardDescription();
              this.isAnswered = true;
              this.isWrong = true;

              //  Logging error
              this.input_data = this.entered_val;
              this.result();
            }

            this.entered_val = "";
          }

          

        }else{

        }
        
    }

    enter() {
      if(this.uinputph === 'finish') {
        this.enableNextCard();
        let that = this;
        this.move_next_timer = setTimeout(()=>{
          that.enableMoveNext();
          that.moveNext();
        }, 1000);
      } else this.checkAnswer();
    }

    repeat() {
      console.log(this.tem_instr);
      console.log(this.card);
      this.playCardDescription();

    }
    
    //	Validation of user input
    validate() {
      if(this.uinputph === 'finish')
        return true;
      else return false;
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
        this.showEnter();
        clearTimeout(this.move_next_timer);
      }
      
    }
    
    //	Create formated user input string for errors log
    getUserInputString() {
      return this.input_data;
    }

    //	Create formated expected string for errors log
    getExpectedString() {
      return this.expected_string;
    }

}
