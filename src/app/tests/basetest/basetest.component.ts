import { Component, OnInit, Input, HostBinding, ElementRef, EventEmitter, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { TestComponent } from '../../components/test/test.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ShowtestingComponent } from 'src/app/components/showtesting/showtesting.component';

@Component({
  selector: 'app-basetest',
  template: ``,
  styleUrls: []
})
export class BasetestComponent implements OnInit, TestComponent {

  public _cpos: number;

  @Input('cpos')
	set cpos(cpos: number) {
	   this._cpos = cpos;
	   this.render();
	}
	get cpos(): number { return this._cpos; }
  
  @Output() mnext = new EventEmitter<boolean>();
	@Output() mprev = new EventEmitter<boolean>();
  @Output() set_global_desc = new EventEmitter<any>();
	@Output() set_global_header = new EventEmitter<any>();
  
  public data: any;

  constructor(private el:ElementRef, private sn: DomSanitizer, private pm: PlaymediaService) { }

  @HostBinding('style.pointerEvents') host_pointerevents: SafeStyle = this.sn.bypassSecurityTrustStyle('none');
	@HostBinding('style.transform') host_transform: SafeStyle = this.sn.bypassSecurityTrustStyle('translateX(0%) rotateY(0deg) translateZ(0)');
	@HostBinding('style.opacity') host_opacity: SafeStyle = this.sn.bypassSecurityTrustStyle('0');
	@HostBinding('style.zIndex') host_zindex: SafeStyle = this.sn.bypassSecurityTrustStyle(String(2000));
	@HostBinding('style.left.px') host_left: SafeStyle = this.sn.bypassSecurityTrustStyle(String(0));
	@HostBinding('class.testwrapperactive') host_bookWrapperActive: boolean = false;

  ngOnInit() {
  }

  render() {
  	
    let that = this;

    let scwidth = 1700;
    let left = (this.data.pos - this._cpos) * scwidth;
    if(left > scwidth * 2) left = scwidth * 2;
    if(left < scwidth * (-1)) left = scwidth * (-1);
    let curr_left_for_back = 0;
  
    //  Animation
		if(this.data.pos !== this._cpos+1 && this.data.pos !== this._cpos-1){	
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(left));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('0');
      this.host_transform = this.sn.bypassSecurityTrustStyle(String('translateX(0%) rotateY(0deg) translateZ(0)'));
      this.host_opacity = this.sn.bypassSecurityTrustStyle('0');
      this.host_pointerevents = this.sn.bypassSecurityTrustStyle('none');
		}
		if(this.data.pos === this._cpos+1){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(curr_left_for_back));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('100');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('translateX(6%) rotateY(-16deg) translateZ(0)'));
      this.host_opacity = this.sn.bypassSecurityTrustStyle('0');
      this.host_pointerevents = this.sn.bypassSecurityTrustStyle('none');
		}
		if(this.data.pos === this._cpos-1){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(curr_left_for_back*(-1)));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('100');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('translateX(-6%) rotateY(16deg) translateZ(0)'));
      this.host_opacity = this.sn.bypassSecurityTrustStyle('0');
      this.host_pointerevents = this.sn.bypassSecurityTrustStyle('none');
		}
		if(this.data.pos === this._cpos){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(left));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('200');
      this.host_transform = this.sn.bypassSecurityTrustStyle(String('translateX(0%) rotateY(0deg) translateZ(0)'));
      this.host_opacity = this.sn.bypassSecurityTrustStyle('1');
      this.host_pointerevents = this.sn.bypassSecurityTrustStyle('auto');
		}

		if(left === 0) {
			this.host_bookWrapperActive = true;
		} else {
			this.host_bookWrapperActive = false;
		}
    

    //	Check if test is current test
    if(this.data.pos === this._cpos) {

      //	Change header according to current test
      //this.setHeader();
      
      //	Change card number
      //this.setTestNumber();

      setTimeout(()=>{
        if(that.isActive()) that.show();
      }, 3);

    }

  }

  show() {
      
  }

  isActive() {
    return this.data.pos === this._cpos;
  }

  next(){
    console.log("I am next");
    this.mnext.emit();

  }

}
