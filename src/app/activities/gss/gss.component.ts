import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gss',
  templateUrl: './gss.component.html',
  styleUrls: ['./gss.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GssComponent extends BaseComponent implements OnInit {

    public temp_word :any;
    public cust_index = 0;
    public entered_val = "";

    public instruct = {"content":[]};
    public respIfIncorrect = {"content":[]};
    public isAnswered = false;
    public count = 0;

    public play_word = "";
    public resp_incorrect = {"content":[{"instructions":[]}]} ;
    public corrected_answer = "";

    public all_Headings = [];
    public all_Skills = [];
    public input_data: any;
    public expected_string: any;
    public uinputph = 'start';
    public move_next_timer: any = null;

  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gsslog: LoggingService, private gsscs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, gsslog, gsscs);
    }

  	ngOnInit() {
      console.log(this.data);
      this.card = this.data;

      this.temp_word = this.data['content'][0].parts.join('').replace(/-/g,'');
      this.play_word = this.temp_word;
      console.log(this.temp_word);

      this.getHeadings();
      this.getSkills();

      this.getInstructions();

      //  Logging card object
      this.card_object = 'Sound';
      
      //  Fill logging info
      this.card_instance = this.temp_word;
      this.expected_string = this.getExpectedHeader(this.data['content'][0].skill);
      this.uinputph = 'question';
    }

    //  Return header value according to skill
    getExpectedHeader(skill){
      for(let i in this.all_Skills){
        let sk = this.all_Skills[i];
        let ind = parseInt(i);
        if(sk.pointer_to_value === skill) return this.all_Headings[ind].pointer_to_value;
      }
      return skill;
    }
    
    getHeadings(){
      for(let i=0; i<this.data['content'][0]['HeadingA'].length;i++){
        this.all_Headings.push(this.data['content'][0]['HeadingA'][i]);
      }

      for(let i=0; i<this.data['content'][0]['HeadingB'].length;i++){
        this.all_Headings.push(this.data['content'][0]['HeadingB'][i]);
      }

      if(this.data['content'][0]['HeadingC']){
        for(let i=0; i<this.data['content'][0]['HeadingC'].length;i++){
          this.all_Headings.push(this.data['content'][0]['HeadingC'][i]);
        }
      }
      

      console.log("#############");
      console.log(this.all_Headings);

    }

    getSkills(){
      for(let i=0; i<this.data['content'][0]['SkillA'].length;i++){
        this.all_Skills.push(this.data['content'][0]['SkillA'][i]);
      }

      for(let i=0; i<this.data['content'][0]['SkillB'].length;i++){
        this.all_Skills.push(this.data['content'][0]['SkillB'][i]);
      }

      if(this.data['content'][0]['SkillC']){
        for(let i=0; i<this.data['content'][0]['SkillC'].length;i++){
          this.all_Skills.push(this.data['content'][0]['SkillC'][i]);
        }
      }
      console.log("#############");
      console.log(this.all_Skills);
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

      for(let i=0; i<this.instruct.content.length;i++){
        if(i != 0)
        this.card.content[0].instructions.push(this.instruct.content[i]);
      }

      console.log(this.instruct.content);
      //this.playCardDescription();

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

    playContentDescription(){
      this.playmedia.word(this.play_word, function(){
      });
      let that = this;
      if(this.isAnswered) {
        setTimeout(()=>{ if(that.isActive()) that.nextWord(); }, 1000);
      }
      //this.blinkEnter();

      if(this.isAnswered && this.cust_index != this.data.content.length){
        for(let i=0; i<this.all_Skills.length; i++){
          if(this.all_Skills[i].pointer_to_value == this.data['content'][this.cust_index].skill){
            this.corrected_answer = this.all_Headings[i].pointer_to_value;//this.data['content'][this.cust_index].skill;
            break;
          }
        }
      }
      
    }


    selectedSound(selected_word, select_header){

      console.log("Index :"+this.cust_index);
      console.log("Selected Word :"+selected_word);
      let that = this;
      if(this.cust_index < this.data['content'].length){
    
        if(selected_word == this.data['content'][this.cust_index].skill && !this.isAnswered){
          // this.cust_index++;
          // this.corrected_answer = "";
          // if(!this.isAnswered){
          //   this.count++;
          // }
          this.playmedia.action('CHIMES', function(){ that.nextWord(); }, 30);
          console.log("If Index :"+this.cust_index);
          // if(this.cust_index < this.data['content'].length){
          //   this.temp_word =  this.data['content'][this.cust_index].parts.join('').replace(/-/g,'');
          //   this.play_word = this.temp_word;
          //   this.playmedia.action('CHIMES', function(){}, 30);
          //   this.isAnswered = false;
          //   this.card.content[0].instructions = [];
          //   this.card.content[0].instructions[0] = this.instruct.content[this.instruct.content.length-1];
          //   this.playCardDescription();
          // }
          this.count++;
          

        }else{
          console.log(this.respIfIncorrect.content.length);

          if(!this.isAnswered){
           
            for(let i=0; i<this.respIfIncorrect.content.length;i++){
              this.resp_incorrect.content[0].instructions[i]=this.respIfIncorrect.content[i];
            }

            this.playmedia.action('DING', function(){}, 30);
            this.isAnswered = true;

          //  this.play_word = this.data['content'][this.cust_index].skill;

            this.card.content[0].instructions = this.resp_incorrect.content[0].instructions;

            this.playCardDescription();

            //  Logging error
            this.input_data = select_header;
            this.result();
            
          }else{
            //this.blinkEnter();
            this.nextWord();
          }

          
        }  
      }else{
        console.log("Corrected : "+this.count);
        this.uinputph = 'finish';
      }
        

    }

    enter(){
      if(this.isAnswered){
        this.nextWord();
      }
    }

    nextWord(){
      this.cust_index++;
      this.corrected_answer = "";
      if(this.cust_index < this.data['content'].length){
        this.temp_word =  this.data['content'][this.cust_index].parts.join('').replace(/-/g,'');
        this.play_word = this.temp_word;

        //  Fill logging info
        this.card_instance = this.temp_word;
        this.expected_string = this.getExpectedHeader(this.data['content'][this.cust_index].skill);
        this.current_presented++;

        this.isAnswered = false;
        this.card.content[0].instructions = [];
        this.card.content[0].instructions[0] = this.instruct.content[this.instruct.content.length-1];
        this.playCardDescription();
      } else {
        this.enableNextCard();
        let that = this;
        this.move_next_timer = setTimeout(()=>{
          that.enableMoveNext();
          that.moveNext();
        }, 2000);
        
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
