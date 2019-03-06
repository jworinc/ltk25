import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarncompleteComponent } from './warncomplete.component';

describe('WarncompleteComponent', () => {
  let component: WarncompleteComponent;
  let fixture: ComponentFixture<WarncompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarncompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarncompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
