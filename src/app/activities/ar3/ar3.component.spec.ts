import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar3Component } from './ar3.component';

describe('Ar3Component', () => {
  let component: Ar3Component;
  let fixture: ComponentFixture<Ar3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
