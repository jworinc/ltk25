import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GwmComponent } from './gwm.component';

describe('GwmComponent', () => {
  let component: GwmComponent;
  let fixture: ComponentFixture<GwmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
