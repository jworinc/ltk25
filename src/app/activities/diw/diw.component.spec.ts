import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiwComponent } from './diw.component';

describe('DiwComponent', () => {
  let component: DiwComponent;
  let fixture: ComponentFixture<DiwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
