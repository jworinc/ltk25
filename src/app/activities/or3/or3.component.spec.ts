import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Or3Component } from './or3.component';

describe('Or3Component', () => {
  let component: Or3Component;
  let fixture: ComponentFixture<Or3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Or3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Or3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
