import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-warncomplete',
  templateUrl: './warncomplete.component.html',
  styleUrls: ['./warncomplete.component.scss']
})
export class WarncompleteComponent implements OnInit {

  constructor() { }

  @Output() closewarncomplete = new EventEmitter<boolean>();
  @Output() gonextcard = new EventEmitter<boolean>();
  

  ngOnInit() {

  }

    //  Perform some actions before close
	close(){
		this.closewarncomplete.emit();
	}

	goNext() {
		this.gonextcard.emit();
		this.close();
	}

}
