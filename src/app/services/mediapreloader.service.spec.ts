import { TestBed } from '@angular/core/testing';

import { MediapreloaderService } from './mediapreloader.service';

describe('MediapreloaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediapreloaderService = TestBed.get(MediapreloaderService);
    expect(service).toBeTruthy();
  });
});
