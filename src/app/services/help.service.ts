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
  public dbclick_timer: any = null;
  public dbclick_flag: boolean = false;
  public dbclick_not_dt: boolean = false;

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
    //this.show_help_dialog.emit();
    this.showAllHelpItems();
  }

  handleMaskHelp(e) {
    console.log(e);
    this.mask = false;
    this.closeAllItems();
  }

  
  chooseElement($event, e) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log("Show help for element: "+e.pos);
    for(let i in this.help_items){
      let h = this.help_items[i];
      //if(h.pos === e.pos) h.showHelpItem();
      //else h.hideHelpItem();
      if(h.pos === e.pos) { h.showHelpItem(); h.outlineHelpItem(); }
      else h.outbackHelpItem();
    }
  }

  showAllHelpItems() {

    //  Get all available to show items
    let itms = [];
    for(let i in this.help_items){
      let h = this.help_items[i];
      let r = h.getTargetRect();
      if(r && (r.left >= 0 && r.top >= 0)){
        itms.push(h);
        h.showHelpItem();
      } else {
        h.hideHelpItem();
      }
      
    }

    


  }

  closeAllItems() {
    for(let i in this.help_items){
      let h = this.help_items[i];
      
      h.hideHelpItem();
      
      
    }
  }

  outbackAllItems() {
    for(let i in this.help_items){
      let h = this.help_items[i];
      
      h.outbackHelpItem();
      
      
    }
  }

  proxyDbClick($event, callback) {
    let that = this;
    if(!this.dbclick_flag) {
      this.dbclick_flag = true;
      this.dbclick_timer = setTimeout(()=>{
        that.dbclick_flag = false;
        that.dbclick_not_dt = true;
        callback();
      }, 200);
    } else {
      clearTimeout(this.dbclick_timer);
      that.dbclick_flag = false;
      //  Get element with help
      let el = $event.target;
      for(let i in this.help_items){
        let h = this.help_items[i];
        
        if(el.classList.contains(h.selector.replace('.', '')) ||
          (el.offsetParent && el.offsetParent.classList.contains(h.selector.replace('.', ''))) ||
          (el.offsetParent.offsetParent && el.offsetParent.offsetParent.classList.contains(h.selector.replace('.', '')))) {
          this.updateTargets();
          this.mask = true;
          h.showHelpItem();
          h.outlineHelpItem();
          break;
        }
        
        
      }

    }
    
  }

  checkForDbClick() {
    if(this.dbclick_not_dt) {
      this.dbclick_not_dt = false;
      return true;
    } else return false;
  }

}
