import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsmComponent } from './gsm.component';

describe('GsmComponent', () => {
  let component: GsmComponent;
  let fixture: ComponentFixture<GsmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
