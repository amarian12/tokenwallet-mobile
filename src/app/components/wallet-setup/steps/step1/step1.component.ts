import { Component, OnInit, Input, HostListener, NgZone } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { MarketService } from '../../../../providers/market.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CSCCrypto } from '../../../../domains/csc-crypto';
import { SessionStorageService, LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { WalletSetup, WalletSettings } from '../../../../domains/csc-types';
import { UUID } from 'angular2-uuid';
import { IonSlides,  AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'wallet-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})

export class Step1Component implements OnInit {
    initialWalletCreation = true;
    walletSettings: WalletSettings = {
      enableOSKB: false,
      showNotifications: false,
      fiatCurrency: 'USD',
      walletUser: "",
      walletLanguage: "en",
      styleTheme:"light"
    };
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
    private marketService: MarketService,
    private alert: AlertController,
    private translate: TranslateService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService

  ) {
      this.logger.debug('### First Step constructor. Setting Language to es ');
      this.translate.setDefaultLang("en");
      this.translate.use("en");

  }

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
    this.walletSettings = this.localStorageService.get(AppConstants.KEY_WALLET_SETTINGS);
    this.logger.debug('### WalletSetup first step. Bringing wallet settings: '+JSON.stringify(this.walletSettings));

    if (!this.walletSettings){
      // settings do not exist yet so create
      this.walletSettings = {
        enableOSKB: false,
        showNotifications: false,
        fiatCurrency: 'USD',
        walletUser: "",
        walletLanguage: "en",
        styleTheme:"light"
      };
      this.localStorageService.set(AppConstants.KEY_WALLET_SETTINGS, this.walletSettings);

      this.logger.debug('### Wallet Setup: Storing default wallet settings ');
    }

    // check if we already have a wallet
    const availableWallets: Array<any> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    if (availableWallets != undefined &&  availableWallets.length >= 1) {
      this.initialWalletCreation = false;
      this.localStorageService.set(AppConstants.KEY_SETUP_COMPLETED, true);
      this.showWarning();
    }else{
      //get our frist coinInfo into the wallet so when we finish set up or recovery, the coininfo is loaded properly.
      // this.marketService.updateCoinInfo();
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
    setTimeout(() => {
      this.slider.update();
      // this.translate.use(this.walletSettings.walletLanguage);
      this.langChanged();
    }, 1000);
  }
  showWarning(){
    this.translate.get(['PAGES.SETUP.STEP5-REMINDER-HEADER',
                        'PAGES.SETUP.STEP5-REMINDER-SUBHEADER',
                        'PAGES.RECOVER.WARNING',
                      'PAGES.SETUP.STEP5-REMINDER-BUTTON']).subscribe((res: string) => {

      this.alert.create({
      header: res['PAGES.SETUP.STEP5-REMINDER-HEADER'],
      subHeader: res['PAGES.SETUP.STEP5-REMINDER-SUBHEADER'],
      message: res['PAGES.RECOVER.WARNING'],
      buttons: [
        {
          text:res['PAGES.SETUP.STEP5-REMINDER-BUTTON'],
          role: 'ok',
          cssClass: 'primary',
          handler: () => {

          }
        }
      ]
    }).then( alert =>  {
        alert.present();
      });
    });
  }
  startSlider() {
      this.logger.debug('### Start Slider Step 1: initialWalletCreation is '+this.initialWalletCreation);
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
  langChanged(){
    this.translate.use(this.walletSettings.walletLanguage);
    this.localStorageService.set(AppConstants.KEY_WALLET_SETTINGS, this.walletSettings);
  }
  cancel(){

      this.router.navigate(['/']);
  }
}
