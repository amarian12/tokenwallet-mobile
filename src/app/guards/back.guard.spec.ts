import { TestBed, async, inject } from '@angular/core/testing';

import { BackGuard } from './back.guard';

describe('BackGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackGuardGuard]
    });
  });

  it('should ...', inject([BackGuardGuard], (guard: BackGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
