import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-snooze',
  templateUrl: './snooze.component.html',
  styleUrls: ['./snooze.component.scss']
})
export class SnoozeComponent implements OnInit {

  constructor() { }

  @Output() continue = new EventEmitter<boolean>();

  ngOnInit() {
  }

  continueLesson() {
    this.continue.emit();
  }

}
