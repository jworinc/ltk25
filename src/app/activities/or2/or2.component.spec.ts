import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Or2Component } from './or2.component';

describe('Or2Component', () => {
  let component: Or2Component;
  let fixture: ComponentFixture<Or2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Or2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Or2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
