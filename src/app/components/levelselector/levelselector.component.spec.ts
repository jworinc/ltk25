import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelselectorComponent } from './levelselector.component';

describe('LevelselectorComponent', () => {
  let component: LevelselectorComponent;
  let fixture: ComponentFixture<LevelselectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelselectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelselectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
