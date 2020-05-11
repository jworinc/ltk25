import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LtkmenuComponent } from './ltkmenu.component';

describe('LtkmenuComponent', () => {
  let component: LtkmenuComponent;
  let fixture: ComponentFixture<LtkmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LtkmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LtkmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
