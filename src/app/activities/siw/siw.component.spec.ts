import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiwComponent } from './siw.component';

describe('SiwComponent', () => {
  let component: SiwComponent;
  let fixture: ComponentFixture<SiwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
