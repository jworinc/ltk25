import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GqwComponent } from './gqw.component';

describe('GqwComponent', () => {
  let component: GqwComponent;
  let fixture: ComponentFixture<GqwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GqwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GqwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
