import { TestBed, async, inject } from '@angular/core/testing';

import { WalletSetupGuard } from './wallet-setup.guard';

describe('WalletSetupGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletSetupGuard]
    });
  });

  it('should ...', inject([WalletSetupGuard], (guard: WalletSetupGuard) => {
    expect(guard).toBeTruthy();
  }));
});
