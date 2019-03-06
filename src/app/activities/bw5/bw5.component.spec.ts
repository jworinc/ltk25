import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw5Component } from './bw5.component';

describe('Bw5Component', () => {
  let component: Bw5Component;
  let fixture: ComponentFixture<Bw5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
