import { Component, OnInit, Input, HostListener, NgZone } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CSCCrypto } from '../../../../domains/csc-crypto';
import { SessionStorageService, LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { WalletSetup } from '../../../../domains/csc-types';
import { UUID } from 'angular2-uuid';
import { IonSlides } from '@ionic/angular';



@Component({
  selector: 'wallet-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})

export class Step1Component implements OnInit {
    initialWalletCreation = true;
@HostListener('window:ionSlidesDidLoad') sliderLoad(){
  this.zone.run(()=>{
    this.startSlider();
  });
};
@HostListener('window:ionSlideReachStart') sliderRestart(){
  this.zone.run(()=>{
    this.startSlider();
  });
};
@Input() slider: IonSlides;

  constructor(
    private logger: LogService,
    private walletService: WalletService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService

  ) { }

  ngOnInit() {

  }
  swipeNext(){
    this.logger.debug('### Go to step 2 triggered');
    this.slider.lockSwipes(false);
    this.slider.slideNext();
    this.slider.lockSwipes(true);
  }
  initialize(){
    this.logger.debug('### Ready first step. Wallet Setup ');
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

     this.walletService.walletSetup.backupLocation = this.electron.remote.getGlobal('vars.backupLocation');
    this.logger.debug('### WalletSetup: ' + JSON.stringify(this.walletService.walletSetup));
  }
  startSlider() {
      this.logger.debug('### INITIAL VALUE IS'+this.initialWalletCreation);
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 0){
         this.initialize();
       }
      });
  }
  goToRestore(){
      this.router.navigate(['/recover-mnemonic']);
  }
}
