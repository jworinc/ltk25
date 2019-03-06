import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Al1Component } from './al1.component';

describe('Al1Component', () => {
  let component: Al1Component;
  let fixture: ComponentFixture<Al1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Al1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Al1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
