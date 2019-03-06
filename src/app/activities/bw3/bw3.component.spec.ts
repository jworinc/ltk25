import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw3Component } from './bw3.component';

describe('Bw3Component', () => {
  let component: Bw3Component;
  let fixture: ComponentFixture<Bw3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
