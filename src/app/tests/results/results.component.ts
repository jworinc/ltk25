import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class ResultsComponent extends BasetestComponent implements OnInit {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
    this.card = this.data;
  }

  show() {
    console.log(this.data);
    
  }

  getValue(r) {
    if(r.presented > 0)
      return Math.round(((r.presented-r.wrong)/r.presented)*100);
    else return 0;
  }

}