import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasearComponent } from './basear.component';

describe('BasearComponent', () => {
  let component: BasearComponent;
  let fixture: ComponentFixture<BasearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
