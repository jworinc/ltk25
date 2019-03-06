import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseorComponent } from './baseor.component';

describe('BaseorComponent', () => {
  let component: BaseorComponent;
  let fixture: ComponentFixture<BaseorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
