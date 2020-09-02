import { Component, OnInit } from '@angular/core';
import { DisplayResultsService } from '../../services/display-results.service';

@Component({
  selector: 'app-display-result',
  templateUrl: './display-result.component.html',
  styleUrls: ['./display-result.component.scss']
})
export class DisplayResultComponent implements OnInit {

  constructor(public drs: DisplayResultsService) { }

  ngOnInit() {
  }

}
