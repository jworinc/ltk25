import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  public show_help_item = new EventEmitter<number>();
  public show_help_dialog = new EventEmitter();
  public build_help_mask = new EventEmitter<any>();
  public help_items = [];
  public targets = [];
  public elm: any = null;
  public mask: boolean = false;

  constructor() { }

  setItems(itms) {
    this.help_items = itms;
  }

  setRootElement(elm) {
    this.elm = elm;
  }

  updateTargets() {
    this.targets = [];
    for(let i in this.help_items){
      let h = this.help_items[i];
      let r = h.getTargetRect();
      if(r) this.targets.push({pos: h.pos, rect: r});
    }
    this.build_help_mask.emit(this.targets);
  }

  prepareHelp() {
    this.updateTargets();
    this.mask = true;
    this.show_help_dialog.emit();
  }

  handleMaskHelp(e) {
    console.log(e);
    this.mask = false;
  }

  
  chooseElement(e) {
    console.log("Show help for element: "+e.pos);
    for(let i in this.help_items){
      let h = this.help_items[i];
      if(h.pos === e.pos) h.showHelpItem();
      else h.hideHelpItem();
    }
  }


}
