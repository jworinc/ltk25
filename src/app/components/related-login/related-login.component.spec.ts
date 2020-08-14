import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedLoginComponent } from './related-login.component';

describe('RelatedLoginComponent', () => {
  let component: RelatedLoginComponent;
  let fixture: ComponentFixture<RelatedLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
