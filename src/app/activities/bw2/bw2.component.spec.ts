import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bw2Component } from './bw2.component';

describe('Bw2Component', () => {
  let component: Bw2Component;
  let fixture: ComponentFixture<Bw2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bw2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bw2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
