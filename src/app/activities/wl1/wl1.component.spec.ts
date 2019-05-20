import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Wl1Component } from './wl1.component';

describe('Wl1Component', () => {
  let component: Wl1Component;
  let fixture: ComponentFixture<Wl1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Wl1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Wl1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
