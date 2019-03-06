import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar5Component } from './ar5.component';

describe('Ar5Component', () => {
  let component: Ar5Component;
  let fixture: ComponentFixture<Ar5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
