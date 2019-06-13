import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DataloaderService } from '../../services/dataloader.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { trigger, transition, animate, style, state } from '@angular/animations'

@Component({
  selector: 'app-grammar',
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.scss'],
  host: {'class': 'grammar-wrapper-slide'},
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
export class GrammarComponent implements OnInit {

  title:string= "Grammar Handbook";
  topics: any;
  description :any;
  temp_topics:any;
  isActive: boolean = false;

  public isNotebook:boolean = true;
  public isDescription:boolean = false;
  public word_data:any;
  //public show_word:string = "";
  public ind = -1 ;
  public subtopic_index = -1;
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
    // this.isNotebook = true;
    // if(this._show){
    //   this.dl.getSightWords().subscribe((w)=>{
    //     console.log(w);
    //     if(this.data == undefined){
    //       this.data = w;
    //       this.card = w;
    //       this.isDescription = false;
    //       this.ind = 0;
    //       this.playWord();
    //     }
        
    //   });
    // }

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
    this.temp_topics = [];
    console.log("I am in component notebook ngonit...");
    this.dl.getGrammarTopics().subscribe(data=>{
        console.log("API DATA ========>");
        console.log(data);
        this.topics = data;
        console.log(this.topics);
        for(let i=0; i<this.topics.length; i++){
          
            this.temp_topics.push(this.topics[i]);
          
        }
        this.fileterArray();
    });
    //this.dataServiceSimulation();
    
  }

  //  This method will be replaced later with real data service API
  dataServiceSimulation() {
    // let data = { "type": 'notebook', "nb_words":[{"word":"Word1","desc":"This is word1"},{"word":"Word2","desc":"This is word2"},{"word":"Word3","desc":"This is word3"},{"word":"Word4","desc":"This is word4"}]};
    // this.data = data;
    let topics = [{"id":1,"topic":"Words","subtopic":"Connecting words",content: "<p>Connectives join two clauses, and show the relationship between them.<br \/> The relationship can show:<\/p>\r\n<ul>\r\n<li><strong>a contrast&nbsp;<\/strong>Although, but, even though, however, despite, in spite of<\/li>\r\n<li><strong>a cause&nbsp;<\/strong>because, because of, as a result of, due to<\/li>\r\n<li><strong>an effect<\/strong>&nbsp;so, consequently, as a result, thus, therefore<\/li>\r\n<\/ul>\r\n<p>These words cannot be used interchangeably. They may be located in different places with in the sentence, and they may use a different grammar.<\/p>\r\n<p><strong><u>Form:<\/u><\/strong><br \/> <strong>a) Connectives showing Contrast<\/strong><br \/> Compare these sentences with the same meaning:<\/p>\r\n<p>i&nbsp;<em>It is sunny&nbsp;<strong>but<\/strong>&nbsp;temperatures are low.<\/em><\/p>\r\n<p>Never start a sentence with&nbsp;<strong>But<\/strong>. You can use&nbsp;<strong>but<\/strong>&nbsp;after a comma (,). In short sentences, no punctuation is needed.<\/p>\r\n<p>ii&nbsp;<strong><em>Although<\/em><\/strong><em>&nbsp;it is sunny, temperatures are low. \/&nbsp;<strong>Even though<\/strong>&nbsp;it is sunny, temperatures are low.<\/em><\/p>\r\n<p>Note how&nbsp;<strong>Although<\/strong>&nbsp;and&nbsp;<strong>Even though<\/strong>&nbsp;are located in a different part of the sentence from But.&nbsp;<strong>Although<\/strong>&nbsp;and&nbsp;<strong>Even though<\/strong>&nbsp;go before the known clause, whereas&nbsp;<strong>but<\/strong>&nbsp;goes before the unknown clause. The two clauses are separated with a comma. The order of clauses can be reversed.<br \/> <br \/> <em>Temperatures are low,&nbsp;<strong>even though \/ although<\/strong>&nbsp;it&rsquo;s sunny.<\/em><\/p>\r\n<p>iii&nbsp;<em>It is sunny.&nbsp;<strong>However<\/strong>, temperatures are low.<\/em><\/p>\r\n<p>Note how&nbsp;<strong>however<\/strong>&nbsp;starts a sentence and is followed by a comma. It may also be seen after a semi-colon (;). Consequently, it is usually seen in longer sentences.<\/p>\r\n<p>iv&nbsp;<strong><em>Despite the sun<\/em><\/strong><em>, temperatures are low.<\/em><br \/> <strong><em>In spite of the sun<\/em><\/strong><em>, temperatures are low.<\/em><\/p>\r\n<p>Note the position of&nbsp;<strong>Despite<\/strong>&nbsp;and&nbsp;<strong>In spite of<\/strong>&nbsp;before the known clause. The order of clauses can be reversed:<br \/> <em>Temperatures are low&nbsp;<strong>despite \/ in spite of<\/strong>&nbsp;the sun.<\/em><\/p>\r\n<p>Also note that these words are followed by a noun, not a verb clause. You can also use the&nbsp;<\/p>\r\n<p><strong>&ndash;ing<\/strong>&nbsp;form of the verb in these sentences.<\/p>\r\n<p><strong><em>Despite&nbsp; \/ In spite of it being<\/em><\/strong><em>&nbsp;sunny, temperatures are low.<\/em><\/p>\r\n<ol>\r\n<li><strong>b) Connectives showing a Cause<\/strong><br \/> Compare these sentences with the same meaning.<\/li>\r\n<\/ol>\r\n<p>i&nbsp;<em>I arrived late&nbsp;<strong>because<\/strong>&nbsp;the traffic was bad.<\/em><br \/> <strong><em>Because<\/em><\/strong><em>&nbsp;the traffic was bad, I arrived late.<\/em><\/p>\r\n<p>Note you can ONLY start a sentence with&nbsp;<strong>Because<\/strong>&nbsp;if there are two clauses in the sentence.<br \/> <br \/> <em><span style=\"text-decoration: line-through;\">Because we were late.<\/span><\/em>&nbsp;INCORRECT<br \/> <em>Because we were late, we missed the start of the show.<\/em><strong>&nbsp;<\/strong>CORRECT<\/p>\r\n<p>Starting a sentence with&nbsp;<strong>Because<\/strong>&nbsp;is more formal than using it in the middle of a sentence, and is most commonly used in writing, not speaking.<\/p>\r\n<p>ii&nbsp;<em>I arrived late&nbsp;<strong>because of<\/strong>&nbsp;the bad traffic.<\/em>&nbsp; &nbsp;&nbsp;OR&nbsp;<strong><em>Because of<\/em><\/strong><em>&nbsp;the bad traffic, I arrived late.<\/em><br \/> <em>I arrived late&nbsp;<strong>due to<\/strong>&nbsp;the bad traffic.&nbsp;&nbsp;&nbsp;<\/em>&nbsp;&nbsp;&nbsp;OR&nbsp;<strong><em>Due to&nbsp;<\/em><\/strong><em>the bad traffic, I arrived late.<\/em><br \/> <em>I arrived late as&nbsp;<strong>a result of<\/strong>&nbsp;the bad traffic.<\/em>&nbsp;OR&nbsp;<strong><em>As a result of<\/em><\/strong><em>&nbsp;the bad traffic, I arrived late.<\/em><\/p>\r\n<p>Note how these expressions are followed by a noun, not a verb clause.<\/p>\r\n<ol>\r\n<li><strong>c) Connectives showing Effect<\/strong><br \/> Compare these sentences with the same meaning.<\/li>\r\n<\/ol>\r\n<p>i&nbsp;<em>We were late&nbsp;<strong>so<\/strong>&nbsp;we missed the beginning of the show.<\/em><\/p>\r\n<p>Never start a sentence with&nbsp;<strong>So<\/strong>.&nbsp;<strong>So&nbsp;<\/strong>can follow a comma(,). In short sentences, no punctuation is needed.<\/p>\r\n<p>ii&nbsp;<em>We were late and&nbsp;<strong>thus<\/strong>&nbsp;we missed the beginning of the show.<\/em><br \/> <em>We were late and&nbsp;<strong>consequently<\/strong>&nbsp;we missed the beginning of the show.<\/em><br \/> <em>We were late and&nbsp;<strong>as a result<\/strong>&nbsp;we missed the beginning of the show.<\/em><br \/> <em>We were late and&nbsp;<strong>therefore&nbsp;<\/strong>we missed the beginning of the show.<\/em><\/p>\r\n<p><strong>Consequently, As a result, Therefore<\/strong>&nbsp;and&nbsp;<strong>Thus<\/strong>&nbsp;are more formal than&nbsp;<strong>So<\/strong>. They are common in formal sentences. They often start a sentence, but they can be joined to the previous sentence with&nbsp;<strong>and<\/strong>.<\/p>\r\n<p><strong><u>Common Mistakes:<\/u><\/strong><br \/> 1. Some students begin sentences with&nbsp;<strong>But<\/strong>&nbsp;and&nbsp;<strong>So<\/strong>.<br \/> <span style=\"text-decoration: line-through;\">Joe went to university. But he didn&rsquo;t like it.<\/span>&nbsp;&rarr; Joe went to university, but he didn&rsquo;t like it.<br \/> 2. Some students write a sentence with because and only one clause.<br \/> <span style=\"text-decoration: line-through;\">I went to the shop. Because I needed some bread.<\/span>&nbsp;&rarr; I went to the shop because I needed some bread.<br \/> 3. Some students do not use nouns when they needed to.<br \/> <span style=\"text-decoration: line-through;\">I went indoors due to it was cold outside.<\/span>&nbsp;&rarr; I went indoors due to the cold weather outside.<\/p>"},
    {"id":3,"topic":"Words","subtopic":"Sight words",content:"<p>Sight words are frequently encountered words that can’t be sounded out – words like the, a, is, of, to, in, and, I, you, and that.  Because they can’t be sounded out or illustrated with pictures, it’s important that children learn to recognize these words on sight.  Because of this, sight word instruction should be an integral part of reading instruction in kindergarten through third grade.  If you’re a parent, you may not see the phrase “sight words” on your child’s spelling list homework but undoubtedly these words are mixed in with others.</p>"},
    {"id":4,"topic":"Words","subtopic":"Some other subtopic",content:"<p>Some other subtopic will be coming soon.</p>"},
    {"id":2,"topic":"Present time","subtopic":"Present Continuous",content:"<p>The present continuous tense is formed with the subject plus the present particle form (-ing) of the main verb and the present continuous tense of the verb to be: am, is, are. ... 'He' is the subject, 'is' is the present tense of the verb to be and 'swimming' is the present participle verb form.</p>"},
    {"id":5,"topic":"Present time","subtopic":"Present Perfect",content:"<p>The present perfect tense refers to an action or state that either occurred at an indefinite time in the past (e.g., we have talked before) or began in the past and continued to the present time (e.g., he has grown impatient over the last hour).</p>"}];

    this.topics = topics;
  }

  updateLayout(){
    this.nblayout = {
      'transform': 'scale('+this._scale+', '+this._scale+')'
    }
  }


filtered_topic:any;

  fileterArray(){

    this.filtered_topic = this.topics.map(item => item.topic)
    .filter((value, index, self) => self.indexOf(value) === index);

    console.log(this.filtered_topic)

  }

  filtered_subtopic:any = [];

  getSubtopics(topic,i){
  
    this.subtopic_index = -1;
     
    if(i == this.ind){
      this.isActive = !this.isActive;
    }else{
      this.isActive = true;
      this.ind = i;
    }

    this.description = [{content:"<span></span>"}]; 
    console.log(this.topics)
    this.filtered_subtopic =  this.topics.filter(item=>{
        return item.topic === topic;
    });

    //this.playWord(topic);

    console.log(this.filtered_subtopic);
  }

  getDescription(topic, subtopic, i, topic_id){
    this.subtopic_index = i;
    this.title = subtopic;
    // this.description = this.topics.filter(item=>{
    //     return item.topic === topic && item.subtopic === subtopic;
    //   });

      

      /* DATA COME IN JSON FROMAT */

      this.dl.getGrammarContent(topic_id).subscribe(data=>{
        console.log(data);
        this.description = data;
      });



      /* DATA COME IN ARRAY FROMAT UNCOMMENT BELOW CODE */

      // this.dl.getGrammarContent(topic_id).subscribe(data=>{
      //   console.log(data);
      //   this.description = this.data.filter(item=>{
      //     return item.topic === topic && item.subtopic === subtopic;
      //   });
      // });

      console.log(this.description);
  }

  playWord(name){
    this.playmedia.sound(name,function(){});
  }

  getMenu(){
      console.log("GET MENUS");
      this.title = "Grammar Handbook";
      this.description = "";
  }

}