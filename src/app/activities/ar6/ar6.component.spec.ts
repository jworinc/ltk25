import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar6Component } from './ar6.component';

describe('Ar6Component', () => {
  let component: Ar6Component;
  let fixture: ComponentFixture<Ar6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
