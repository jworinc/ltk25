import { TestBed } from '@angular/core/testing';

import { ColorschemeService } from './colorscheme.service';

describe('ColorschemeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColorschemeService = TestBed.get(ColorschemeService);
    expect(service).toBeTruthy();
  });
});
