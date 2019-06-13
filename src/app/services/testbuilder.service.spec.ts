import { TestBed } from '@angular/core/testing';

import { TestbuilderService } from './testbuilder.service';

describe('TestbuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TestbuilderService = TestBed.get(TestbuilderService);
    expect(service).toBeTruthy();
  });
});
