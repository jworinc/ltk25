import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bs1Component } from './bs1.component';

describe('GmuComponent', () => {
  let component: Bs1Component;
  let fixture: ComponentFixture<Bs1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bs1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bs1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
