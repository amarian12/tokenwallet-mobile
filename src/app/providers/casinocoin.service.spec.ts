import { TestBed } from '@angular/core/testing';

import { CasinocoinService } from './casinocoin.service';

describe('CasinocoinService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CasinocoinService = TestBed.get(CasinocoinService);
    expect(service).toBeTruthy();
  });
});
