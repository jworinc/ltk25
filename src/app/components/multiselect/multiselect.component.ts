import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PickElementService } from '../../services/pick-element.service';
//import { PlaymediaService } from '../../services/playmedia.service';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss']
})
export class MultiselectComponent implements OnInit {

  @Input() num: number;
  @Input() type: string;
  @Input() right: any;

  @Output() public result = new EventEmitter();

  public varitems: any = [];
  public answer_received: boolean = false;
  public old_input: any;

  //constructor(private pms: PlaymediaService) { }
  constructor(private pe: PickElementService) { }

  ngOnInit() {
    //this.update();
  }

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

  handleUserAnswer(v) {
    /*
    if(this.old_input !== v) this.answer_received = false;
    if(!this.answer_received){
      this.answer_received = true;
      this.old_input = v;
      this.result.emit(v);
    }
    */
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.result.emit(v);
      
  }

  update() {
    let that = this;
    setTimeout(()=>{ that.updateproc(); }, 10);
    this.answer_received = false;
  }

  updateproc() {

      let items = [];
      //  Define depending on type variants for unswer
      if(typeof this.type !== 'undefined' && this.type === 'numbers'){
        //for(let i=0; i<this.num-1; i++) items.push(Math.round(Math.random()*8)+1);
        let n = this.num < 5 ? this.num : 5;
        while(items.length < n - 1) {
          let i = Math.round(Math.random()*8)+1;
          if(items.indexOf(i) < 0) items.push(i);
        }
      }
      else if(typeof this.type !== 'undefined' && this.type === 'vowels'){
        items = ['a', 'e', 'i', 'o', 'u'];
      }

      //  Check if right answer already included
      if(items.indexOf(this.right) < 0) items.push(this.right);
        
      this.varitems = this.shuffle(items);
  }

}
