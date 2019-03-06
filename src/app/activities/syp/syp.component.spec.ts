import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SypComponent } from './syp.component';

describe('SypComponent', () => {
  let component: SypComponent;
  let fixture: ComponentFixture<SypComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SypComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SypComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
