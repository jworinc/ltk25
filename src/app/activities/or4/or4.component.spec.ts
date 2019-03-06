import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Or4Component } from './or4.component';

describe('Or4Component', () => {
  let component: Or4Component;
  let fixture: ComponentFixture<Or4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Or4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Or4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
