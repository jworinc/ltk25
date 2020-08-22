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

  public complete_res = [];
  public continue: boolean = false;
  public show_next: boolean = false;

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
    this.card = this.data;
  }

  show() {
    console.log(this.data);
    this.complete_res = this.parseCompleteResult(this.data.content.results);
  }

  getValue(r) {
    if(r.presented > 0){
      //  Success without treshold
      //let st = r.average - r.treshold;
      //  Get percentage of corrected success, treshold correction
      //let rs = 0;
      //if(st > 0) rs = Math.round((st / (100 - r.treshold)) * 100);
      return r.average;
    }
      
    else return 0;
  }

  enableContinue() {
    this.continue = true;
  }

}