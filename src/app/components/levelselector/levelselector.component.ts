import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-levelselector',
  templateUrl: './levelselector.component.html',
  styleUrls: ['./levelselector.component.scss']
})
export class LevelselectorComponent implements OnInit {

  constructor() { }

  @Output() public levelset = new EventEmitter<number>();
  @Input() level: number;
  @Input() units: string;
  @Input() min: number;
  @Input() max: number;
  @Input() step: number;

  public _level: any;
  public _unit: any;

  ngOnInit() {

  }

    //  Check if all values are integer
    prepVals(){
        this._level = this.level = +this.level;
        this.min = +this.min;
        this.max = +this.max;
        this.step = +this.step;
    }

    //  Level up handler
    levelUp(){
        this.prepVals();
        this.level+=this.level>=this.max?0:this.step;
        this.levelset.emit(this.level);
    }

    //  Level down handler
    levelDown(){
        this.prepVals();
        this.level-=this.level<=this.min?0:this.step;
        this.levelset.emit(this.level);
    }

}
