import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';


@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class IntroComponent extends BasetestComponent implements OnInit {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  public show_next: boolean = true;

  ngOnInit() {
  }

  show() {
    console.log(this.data);
    
  }

}
