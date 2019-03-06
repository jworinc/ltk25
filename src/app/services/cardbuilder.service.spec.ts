import { TestBed } from '@angular/core/testing';

import { CardbuilderService } from './cardbuilder.service';

describe('CardbuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardbuilderService = TestBed.get(CardbuilderService);
    expect(service).toBeTruthy();
  });
});
