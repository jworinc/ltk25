import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseExpireMsgComponent } from './course-expire-msg.component';

describe('CourseExpireMsgComponent', () => {
  let component: CourseExpireMsgComponent;
  let fixture: ComponentFixture<CourseExpireMsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseExpireMsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseExpireMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
