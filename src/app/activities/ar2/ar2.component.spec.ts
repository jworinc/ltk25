import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar2Component } from './ar2.component';

describe('Ar2Component', () => {
  let component: Ar2Component;
  let fixture: ComponentFixture<Ar2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
