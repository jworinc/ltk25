import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar1Component } from './ar1.component';

describe('Ar1Component', () => {
  let component: Ar1Component;
  let fixture: ComponentFixture<Ar1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
