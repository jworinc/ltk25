import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementReportComponent } from './placement-report.component';

describe('PlacementReportComponent', () => {
  let component: PlacementReportComponent;
  let fixture: ComponentFixture<PlacementReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacementReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
