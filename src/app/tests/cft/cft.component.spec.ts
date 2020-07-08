import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CftComponent } from './cft.component';

describe('CftComponent', () => {
  let component: CftComponent;
  let fixture: ComponentFixture<CftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
