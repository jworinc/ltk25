import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-or2',
  templateUrl: './or2.component.html',
  styleUrls: ['./or2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Or2Component extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private or2log: LoggingService, private or2cs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, or2log, or2cs);
  }

  ngOnInit() {
  }



}