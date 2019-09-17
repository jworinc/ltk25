import { TestBed } from '@angular/core/testing';

import { CustomfieldService } from './customfield.service';

describe('CustomfieldService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomfieldService = TestBed.get(CustomfieldService);
    expect(service).toBeTruthy();
  });
});
