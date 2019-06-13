import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtestingComponent } from './showtesting.component';

describe('ShowtestingComponent', () => {
  let component: ShowtestingComponent;
  let fixture: ComponentFixture<ShowtestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowtestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowtestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
