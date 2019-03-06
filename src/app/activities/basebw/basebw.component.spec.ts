import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasebwComponent } from './basebw.component';

describe('BasebwComponent', () => {
  let component: BasebwComponent;
  let fixture: ComponentFixture<BasebwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasebwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasebwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
