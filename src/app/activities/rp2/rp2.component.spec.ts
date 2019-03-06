import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Rp2Component } from './rp2.component';

describe('Rp2Component', () => {
  let component: Rp2Component;
  let fixture: ComponentFixture<Rp2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Rp2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Rp2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
