import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GdnComponent } from './gdn.component';

describe('GdnComponent', () => {
  let component: GdnComponent;
  let fixture: ComponentFixture<GdnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GdnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GdnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
