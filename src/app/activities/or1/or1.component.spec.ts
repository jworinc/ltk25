import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Or1Component } from './or1.component';

describe('Or1Component', () => {
  let component: Or1Component;
  let fixture: ComponentFixture<Or1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Or1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Or1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
