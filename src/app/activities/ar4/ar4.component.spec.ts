import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ar4Component } from './ar4.component';

describe('Ar4Component', () => {
  let component: Ar4Component;
  let fixture: ComponentFixture<Ar4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ar4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ar4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
