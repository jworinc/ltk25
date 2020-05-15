import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkingNotepadComponent } from './talking-notepad.component';

describe('TalkingNotepadComponent', () => {
  let component: TalkingNotepadComponent;
  let fixture: ComponentFixture<TalkingNotepadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TalkingNotepadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TalkingNotepadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
