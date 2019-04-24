import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GmuComponent } from './gmu.component';

describe('GmuComponent', () => {
  let component: GmuComponent;
  let fixture: ComponentFixture<GmuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GmuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GmuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
