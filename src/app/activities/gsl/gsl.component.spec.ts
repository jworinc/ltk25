import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GslComponent } from './gsl.component';

describe('GslComponent', () => {
  let component: GslComponent;
  let fixture: ComponentFixture<GslComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GslComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GslComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
