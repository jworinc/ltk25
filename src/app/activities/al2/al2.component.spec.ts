import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Al2Component } from './al2.component';

describe('Al2Component', () => {
  let component: Al2Component;
  let fixture: ComponentFixture<Al2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Al2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Al2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
