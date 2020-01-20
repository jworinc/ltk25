import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnoozeComponent } from './snooze.component';

describe('SnoozeComponent', () => {
  let component: SnoozeComponent;
  let fixture: ComponentFixture<SnoozeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnoozeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnoozeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
