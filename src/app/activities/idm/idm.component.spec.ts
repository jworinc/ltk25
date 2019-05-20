import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Rw1Component } from './rw1.component';

describe('Rw1Component', () => {
  let component: Rw1Component;
  let fixture: ComponentFixture<Rw1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Rw1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Rw1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
