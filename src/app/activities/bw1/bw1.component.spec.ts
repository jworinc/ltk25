import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw1Component } from './bw1.component';

describe('Bw1Component', () => {
  let component: Bw1Component;
  let fixture: ComponentFixture<Bw1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
