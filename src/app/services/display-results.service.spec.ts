import { TestBed } from '@angular/core/testing';

import { DisplayResultsService } from './display-results.service';

describe('DisplayResultsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DisplayResultsService = TestBed.get(DisplayResultsService);
    expect(service).toBeTruthy();
  });
});
