import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsmenuComponent } from './msmenu.component';

describe('MsmenuComponent', () => {
  let component: MsmenuComponent;
  let fixture: ComponentFixture<MsmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
