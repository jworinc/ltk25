import { TestBed } from '@angular/core/testing';

import { ErrorLogService } from './error-log.service';

describe('ErrorLogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ErrorLogService = TestBed.get(ErrorLogService);
    expect(service).toBeTruthy();
  });
});
