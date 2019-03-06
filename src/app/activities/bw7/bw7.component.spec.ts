import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw7Component } from './bw7.component';

describe('Bw7Component', () => {
  let component: Bw7Component;
  let fixture: ComponentFixture<Bw7Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw7Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
