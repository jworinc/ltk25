import { TestBed } from '@angular/core/testing';

import { PlaymediaService } from './playmedia.service';

describe('PlaymediaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlaymediaService = TestBed.get(PlaymediaService);
    expect(service).toBeTruthy();
  });
});
