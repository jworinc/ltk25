import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { PlaymediaService } from '../../services/playmedia.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  host: {'class': 'help-service-mask'}
})
export class HelpComponent implements OnInit {

  constructor(public hs: HelpService, public pm: PlaymediaService) { }

  @Output() closehelp = new EventEmitter<boolean>();
  @Output() gonextcard = new EventEmitter<boolean>();
  
  public show_dialog: boolean = false;

  public targets = [];

  ngOnInit() {
    let that = this;
    this.hs.show_help_dialog.subscribe(()=>{
      that.show_dialog = true;
      that.pm.stop();
      that.pm.help('_SCOEYAII', ()=>{}, 200);
    });
    this.hs.build_help_mask.subscribe((tgs)=>{
      that.buildMask(tgs);
    });
  }

  ngOnDestroy() {
    this.hs.show_help_dialog.unsubscribe();
    this.hs.build_help_mask.unsubscribe();
  }

  @HostListener('click', ['$event']) onClick($event) {
    if(!this.show_dialog) this.hs.handleMaskHelp($event);
  }

    //  Perform some actions before close
	close($event){
    this.closehelp.emit();
    this.pm.stop();
    let that = this;
    //  Make delay to prevent closing help mask
    setTimeout(()=>{ that.show_dialog = false; }, 200);
  }
  
	goNext($event) {
		this.gonextcard.emit();
		this.close($event);
  }

  buildMask(tgs){
    this.targets = tgs;
  }

}
