import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PickElementService } from '../../services/pick-element.service';

@Component({
  selector: 'app-levelselector',
  templateUrl: './levelselector.component.html',
  styleUrls: ['./levelselector.component.scss']
})
export class LevelselectorComponent implements OnInit {

  constructor(private pe: PickElementService) { }

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
        //	If mouse event locked by feedback
        if(this.pe.mouseLock()) return;
        this.prepVals();
        this.level+=this.level>=this.max?0:this.step;
        this.levelset.emit(this.level);
    }

    //  Level down handler
    levelDown(){
        //	If mouse event locked by feedback
        if(this.pe.mouseLock()) return;
        this.prepVals();
        this.level-=this.level<=this.min?0:this.step;
        this.levelset.emit(this.level);
    }

}
