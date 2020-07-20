import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { TokenService } from '../../services/token.service';
import { DataloaderService } from '../../services/dataloader.service';

@Component({
  selector: 'app-resultspcm',
  templateUrl: './resultspcm.component.html',
  styleUrls: ['./resultspcm.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class ResultspcmComponent extends BasetestComponent implements OnInit {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, public tn: TokenService, private dl: DataloaderService) { 
    super(element, sz, pms);
  }

  public complete_level = {
    level: "",
    start: "",
    lesson: 0
  };

  public complete_res = [];
  public rrrequest_sent = false;
  public rrrequest_start = false;
  public u_email = '';
  public u_name = '';
  public practice_mode: boolean = false;

  ngOnInit() {
    this.card = this.data;
  }

  show() {
    console.log(this.data);
    this.u_email = this.tn.getEmail();
    this.u_name = this.tn.getName();
    //this.rrrequest_sent = false;
    this.rrrequest_start = false;
    this.complete_res = this.parseCompleteResult(this.data.content.results);
  }

  sendRegisterRequest() {
    let that = this;
    this.rrrequest_start = true;
    this.dl.sendRegisterRequest(this.tn.getEmail()).then((e)=>{
      that.rrrequest_sent = true;
    });
  }

  sendCorrectRegisterRequest() {
    let that = this;
    this.rrrequest_start = true;
    this.dl.sendRegisterRequest(this.u_email, this.u_name).then((e)=>{
      that.rrrequest_sent = true;
    });
  }

  complete() {
    this.rrrequest_start = true;
    this.request_complete.emit();
  }

}