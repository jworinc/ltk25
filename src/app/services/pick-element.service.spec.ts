import { TestBed } from '@angular/core/testing';

import { PickElementService } from './pick-element.service';

describe('PickElementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PickElementService = TestBed.get(PickElementService);
    expect(service).toBeTruthy();
  });
});
