import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LogService } from '../../providers/log.service';
import { IonSlides } from '@ionic/angular';
import { CSCCrypto } from '../../domains/csc-crypto';
import { SessionStorageService, LocalStorageService } from 'ngx-store';
import { WalletService } from '../../providers/wallet.service';
import { AppConstants } from '../../domains/app-constants';
import { WalletSetup } from '../../domains/csc-types';
import { UUID } from 'angular2-uuid';
@Component({
  selector: 'app-wallet-setup',
  templateUrl: './wallet-setup.component.html',
  styleUrls: ['./wallet-setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WalletSetupComponent implements OnInit {
// Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {};
  initialWalletCreation = true;
  @ViewChild('walletSetup', { static: true }) slides: IonSlides;
  constructor(  private logger: LogService,
                private walletService: WalletService,
                private localStorageService: LocalStorageService
              ) {

                }

  ngOnInit() {
    this.slideOpts= AppConstants.SLIDE_CUBE_EFFECT;
    this.slides.lockSwipes(true);
    this.logger.debug('### INIT WalletSetup ###');

    // check if we already have a wallet
    const availableWallets: Array<any> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    if (availableWallets != null &&  availableWallets.length >= 1) {
      this.initialWalletCreation = false;
    }
    this.logger.debug('### WalletSetup: There are these wallets here ' + JSON.stringify(availableWallets));
    // generate recovery words
    this.walletService.walletSetup = {} as WalletSetup;
    this.walletService.walletSetup.recoveryMnemonicWords = CSCCrypto.getRandomMnemonic();
    // set network default to LIVE
    this.walletService.walletSetup.testNetwork = false;

    // generate wallet UUID
    this.walletService.walletSetup.walletUUID = UUID.UUID();
    // set backup location

    // this.walletService.walletSetup.backupLocation = this.electron.remote.getGlobal('vars.backupLocation');
    this.logger.debug('### WalletSetup: ' + JSON.stringify(this.walletService.walletSetup));
  }
  slideChanged() {
  console.log(this.slides.getActiveIndex());
  }
}
