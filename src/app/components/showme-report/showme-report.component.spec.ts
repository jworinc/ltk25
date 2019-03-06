import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowmeReportComponent } from './showme-report.component';

describe('ShowmeReportComponent', () => {
  let component: ShowmeReportComponent;
  let fixture: ComponentFixture<ShowmeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowmeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowmeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
