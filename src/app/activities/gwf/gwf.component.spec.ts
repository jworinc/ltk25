import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GwfComponent } from './gwf.component';

describe('GwfComponent', () => {
  let component: GwfComponent;
  let fixture: ComponentFixture<GwfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
