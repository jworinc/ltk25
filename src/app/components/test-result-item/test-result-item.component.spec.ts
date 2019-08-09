import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestResultItemComponent } from './test-result-item.component';

describe('TestResultItemComponent', () => {
  let component: TestResultItemComponent;
  let fixture: ComponentFixture<TestResultItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestResultItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestResultItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
