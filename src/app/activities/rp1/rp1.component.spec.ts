import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Rp1Component } from './rp1.component';

describe('Rp1Component', () => {
  let component: Rp1Component;
  let fixture: ComponentFixture<Rp1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Rp1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Rp1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
