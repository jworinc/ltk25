import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw6Component } from './bw6.component';

describe('Bw6Component', () => {
  let component: Bw6Component;
  let fixture: ComponentFixture<Bw6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
