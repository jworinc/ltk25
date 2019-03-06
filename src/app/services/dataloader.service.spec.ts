import { TestBed } from '@angular/core/testing';

import { DataloaderService } from './dataloader.service';

describe('DataloaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataloaderService = TestBed.get(DataloaderService);
    expect(service).toBeTruthy();
  });
});
