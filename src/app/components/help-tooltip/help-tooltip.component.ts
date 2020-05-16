import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ElementRef, HostListener } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { PlaymediaService } from '../../services/playmedia.service';

@Component({
  selector: 'app-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss']
})
export class HelpTooltipComponent implements OnInit {

  //@Output() public showhelp = new EventEmitter<boolean>();
  @Input() public pos: number;
  @Input() public selector: string;
  @Input() public content: string;
  @Input() public align: string;
  @Input() public audio: string;
  //@Input() public align_mobile: string;
  
  @HostBinding('class') selfclass = '';
  @HostBinding('style.display') selfdisplay = 'none';
  @HostBinding('style.opacity') selfopacity = '0';

  public _show: boolean = false;
  public rect: any = null;
  public current_width = 0;
  public current_height = 0;
  public descposition = null;
  public align_top_left: boolean = false;
  public align_top_right: boolean = false;
  public align_bottom_left: boolean = false;
  public align_bottom_right: boolean = false;
  public align_center_top: boolean =false;
  public align_center_bottom: boolean = false;
  public align_center_left: boolean = false;
  public align_center_right: boolean = false;

  constructor(public hs: HelpService, public el: ElementRef, public pm: PlaymediaService) { }

  @HostListener('click', ['$event']) onClick($event) {
    this.hideHelpItem();
  }

  ngOnInit() {

    if(this.align === 'align-top-left') this.align_top_left = true;
    if(this.align === 'align-top-right') this.align_top_right = true;
    if(this.align === 'align-bottom-left') this.align_bottom_left = true;
    if(this.align === 'align-bottom-right') this.align_bottom_right = true;
    if(this.align === 'align-center-left') this.align_center_left = true;
    if(this.align === 'align-center-right') this.align_center_right = true;
    if(this.align === 'align-center-bottom') this.align_center_bottom = true;
    if(this.align === 'align-center-top') this.align_center_top = true;



  }

  getTargetRect() {
    let r = this.hs.elm;
    let e = r.querySelector(this.selector);
    if(!e) return null;
    let off = this.getTargetOffset(e);
    if(!off) return null;
    return {width: e.clientWidth, height: e.clientHeight, left: off.left, top: off.top};
  }

  getTargetOffset(t) {
    
    let e = t.getClientRects();
    
    if(e.length > 0) return {top: e[0].top, left: e[0].left};
    else return null;
  }

  setPositionForDescription() {
      let that = this;
      //  Get width and height of description element
      let cd = that.el.nativeElement.querySelector('.help-item-description');
      let cp = that.el.nativeElement.querySelector('.help-item-pointer');
      let dp = null;
      //  Set position for description depending on align
      if(this.align === 'align-top-left') dp = {left: (that.rect.left + that.rect.width), top: (that.rect.top + that.rect.height)};
      if(this.align === 'align-top-right') dp = {left: (that.rect.left - cd.clientWidth), top: (that.rect.top + that.rect.height)};
      if(this.align === 'align-bottom-left') dp = {left: (that.rect.left + that.rect.width), top: (that.rect.top - cd.clientHeight)};
      if(this.align === 'align-bottom-right') dp = {left: (that.rect.left - cd.clientWidth), top: (that.rect.top - cd.clientHeight)};
      if(this.align === 'align-center-right') dp = {left: (that.rect.left - cd.clientWidth - cp.clientWidth), top: (that.rect.top + (that.rect.height/2) - (cd.clientHeight/2))};
      if(this.align === 'align-center-left') dp = {left: (that.rect.left + that.rect.width + cp.clientWidth), top: (that.rect.top + (that.rect.height/2) - (cd.clientHeight/2))};
      if(this.align === 'align-center-bottom') dp = {left: (that.rect.left + (that.rect.width/2) - (cd.clientWidth/2)), top: (that.rect.top - cd.clientHeight - cp.clientHeight)};
      if(this.align === 'align-center-top') dp = {left: (that.rect.left + (that.rect.width/2) - (cd.clientWidth/2)), top: (that.rect.top + that.rect.height + cp.clientHeight)};
      
      //  Check if desc position fit on the screen
      if(dp.left < 0) dp.left = 0;
      if((dp.left+cd.clientWidth) > this.current_width) dp.left = this.current_width - cd.clientWidth;
      if(dp.top < 0) dp.top = 0;
      if((dp.top+cd.clientHeight) > this.current_height) dp.top = this.current_height - cd.clientHeight;

      //  Store postions to element style object
      this.descposition = {'left': dp.left + 'px', 'top': dp.top + 'px'};

  }

  showHelpItem() {

    //if(!this.rect) this.rect = this.getTargetRect();
    this.rect = this.getTargetRect();
    this.selfdisplay = 'block';
    let that = this;
    setTimeout(()=>{
      that.selfopacity = '1';
      that.current_width = that.el.nativeElement.clientWidth;
      that.current_height = that.el.nativeElement.clientHeight;
      setTimeout(()=>{ that.showItemMask(that.rect); }, 20);
      that.setPositionForDescription();
      that.pm.stop();
      that.pm.help(that.audio, ()=>{}, 200);
    }, 20);

  }

  hideHelpItem() {
    this.pm.stop();
    this.selfdisplay = 'none';
    this.selfopacity = '0';
  }

  showItemMask(rect) {
    let canvas = this.el.nativeElement.querySelector('#mask-canvas');
    if(canvas) {
      let width = canvas.clientWidth;
      let height = canvas.clientHeight;
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      ctx.clearRect((rect.left >=0 ? rect.left : 0)-(rect.width*0.05), (rect.top >= 0 ? rect.top : 0)-(rect.height*0.05), rect.width*1.1, rect.height*1.1);
      //ctx.clearRect(50, 50, 300, 120);
    }
  }

}
