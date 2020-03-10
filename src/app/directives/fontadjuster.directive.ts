import { Directive, ElementRef, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appFontadjuster]'
})
export class FontadjusterDirective {

  @HostBinding('style.fontSize') font_size: string = '20px';
  @Input() fontcorrection: number = 0;

  constructor(private elm: ElementRef) { 
    

  }

  update(){

    let elm = this.elm;
    //  Get current block text length
    let bl = elm.nativeElement.innerText.length;
    //  Get current block width
    let bw = elm.nativeElement.clientWidth;
    //  Get current block height
    let bh = elm.nativeElement.clientHeight;
    //  Calc required font size
    let x = Math.sqrt((bw*bh)/bl);
    let f = Math.round((45.2 + (13*x)) / 16.88);
    if(typeof this.fontcorrection !== 'undefined') f = f - this.fontcorrection;
    this.font_size = f + 'px';
    //  Output debug info
    console.log("Font adjuster started >>>><<<<");
    console.log({length: bl, width: bw, height: bh, font: f});

  }

}
