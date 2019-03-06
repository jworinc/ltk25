import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GscComponent } from './gsc.component';

describe('GscComponent', () => {
  let component: GscComponent;
  let fixture: ComponentFixture<GscComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GscComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
