import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { DataloaderService } from '../../services/dataloader.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  host: {'class': 'help-service-mask'}
})
export class HelpComponent implements OnInit {

  constructor(public hs: HelpService, public pm: PlaymediaService, public dl: DataloaderService) { }

  @Output() closehelp = new EventEmitter<boolean>();
  @Output() gonextcard = new EventEmitter<boolean>();
  
  public show_dialog: boolean = false;

  public targets = [];

  public show_help_dialog_event: any;
  public build_help_mask_event: any;

  public help_menu: boolean = false;
  public help_menu_items: any = [];

  ngOnInit() {
    let that = this;
    this.show_help_dialog_event = this.hs.show_help_dialog.subscribe(()=>{
      that.show_dialog = true;
      that.pm.stop();
      that.pm.help('_SCOEYAII', ()=>{}, 200);
    });
    this.build_help_mask_event = this.hs.build_help_mask.subscribe((tgs)=>{
      that.buildMask(tgs);
    });
  }

  ngOnDestroy() {
    this.show_help_dialog_event.unsubscribe();
    this.build_help_mask_event.unsubscribe();
  }

  @HostListener('click', ['$event']) onClick($event) {
    if(!this.show_dialog) {
      this.hs.handleMaskHelp($event);
      this.closeHelpMenu();
    }
  }

    //  Perform some actions before close
	close($event){
    this.closehelp.emit();
    this.pm.stop();
    let that = this;
    //  Make delay to prevent closing help mask
    setTimeout(()=>{ that.show_dialog = false; }, 200);
    this.hs.closeAllItems();
    this.closeHelpMenu();
  }
  
	goNext($event) {
		this.gonextcard.emit();
		this.close($event);
  }

  buildMask(tgs){
    this.targets = tgs;
  }

  showHelpMenu($event) {
    $event.preventDefault();
    $event.stopPropagation();
    let that = this;
    this.dl.getHelpConfiguration().then((data)=>{
      console.log("Help Menu configuration loaded", data);
      that.help_menu_items = data;
    }).catch((e)=>{
      console.log("Erro during loading help menu configuration", e);
    });

    //this.help_menu = true;

  }

  closeHelpMenu($event = null) {

    if($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    
    this.help_menu = false;
  }

}
