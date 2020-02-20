import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { WalletSettings } from '../../domains/csc-types';
import { TranslateService } from '@ngx-translate/core';
import { AppflowService } from '../../providers/appflow.service';
import { LogService } from '../../providers/log.service';
import { MarketService } from '../../providers/market.service';
import { CSCCrypto } from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { LocalStorageService } from 'ngx-store';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
walletSettings: WalletSettings;
enableFaio: boolean;
  constructor(
    private appflow:AppflowService,
    private logger:LogService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private marketService: MarketService,
    public localStorageService: LocalStorageService,
    private alert: AlertController

  ) {

    this.enableFaio = this.localStorageService.get(AppConstants.KEY_WALLET_FAIO_ENABLED)?
                      this.localStorageService.get(AppConstants.KEY_WALLET_FAIO_ENABLED):false;

  }

  ngOnInit() {
    this.walletSettings = this.appflow.walletSettings;


  }
  ionViewWillEnter(){
    if(this.appflow.dark){
      this.walletSettings.styleTheme = "dark";
    }else{
      this.walletSettings.styleTheme = "light";
      this.logger.debug(" ### Settings Page :: Current Settings: " + JSON.stringify(this.walletSettings));
    }

  }
  saveSettings(){
    this.logger.debug(" ### Settings Page :: Settings to be saved : " + JSON.stringify(this.walletSettings));
    this.logger.debug(" ### Settings Page :: Settings on appflow : " + JSON.stringify(this.appflow.walletSettings));
    this.appflow.saveWalletSettings(this.walletSettings);
    // this.themeChanged();
    // this.langChanged();
    // this.router.navigate(['/']);
  }
  restoreDefaultSettings(){
    this.logger.debug(" ### Settings Page :: Settings to be reverted : " + JSON.stringify(this.walletSettings));
    this.walletSettings = {
      enableOSKB: false,
      showNotifications: false,
      fiatCurrency: 'USD',
      walletUser: "",
      walletLanguage: "en",
      styleTheme:"light"
    };

    this.logger.debug(" ### Settings Page :: Reverting to Settings: " + JSON.stringify(this.walletSettings));
    // this.router.navigate(['/']);

  }
  settingChanged(){
    this.logger.debug(" ### Settings Page :: Changing settings: " + this.walletSettings.walletUser);
    this.saveSettings();

  }
  themeChanged(){
    if(this.walletSettings.styleTheme == "light"){
      this.appflow.dark = false;
    }else{
      this.appflow.dark = true;

    }
    this.saveSettings();
  }
  langChanged(){
    this.translate.use(this.walletSettings.walletLanguage);
    this.saveSettings();
  }
  currencyChanged(){
    this.marketService.changeCurrency(this.walletSettings.fiatCurrency);
    this.saveSettings();
  }
  enableOSKBChanged(){
    // this.walletSettings.enableOSKB = !this.walletSettings.enableOSKB;
    this.saveSettings();
  }
  async touchIdChanged(){
    let callbackFaio:any;
    // this.enableFaio != this.enableFaio;
    const wordEnable = this.enableFaio?"disable":"enable";
    this.logger.debug(" ### Settings Page :: enable FAIO value: " + this.enableFaio);
    if(!this.enableFaio){
      callbackFaio = (res) => {
        this.logger.debug(" ### Settings Page :: examine response: " + JSON.stringify(res));
        if(res.data.state){
          const enteredPinCode = res.data.password;
          const walletEmail = res.data.email;
          const hash = res.data.hash;
          this.logger.debug(" ### Settings Page :: Crypto params for enabling FAIO: hash:" + hash +" email:"+walletEmail+" pin:"+enteredPinCode);
          let cscCrypto = new CSCCrypto(hash, walletEmail);
          const encryptedPIN = cscCrypto.encrypt(enteredPinCode);
          this.localStorageService.set(AppConstants.KEY_WALLET_ENCRYPTED_PIN, encryptedPIN);
          this.logger.debug(" ### Settings Page :: Successfully enabled FAIO: " + encryptedPIN);
          this.logger.debug(" ### Settings Page :: Successfully enabled FAIO faio:"+this.enableFaio);
          return res;
        }else{
          this.logger.debug(" ### Settings Page :: Failed enabling FAIO  BAD PIN?");
          this.enableFaio != this.enableFaio;
          return res;
        }
      }

    }else{
      callbackFaio = (res) => {
        if(res.data.state){
          this.localStorageService.set(AppConstants.KEY_WALLET_ENCRYPTED_PIN, "");

          this.logger.debug(" ### Settings Page :: Successfully disabled FAIO faio:"+this.enableFaio);
          return res;
        }else{
          this.logger.debug(" ### Settings Page :: Failed disabling FAIO  fingerprint error?");
          this.enableFaio != this.enableFaio;
          return res;
        }

      }
    }
    const final = await this.appflow.onValidateTx("toggleFaio","Authenticate to "+wordEnable+" device fingerprint authentication",this.walletSettings.styleTheme, callbackFaio);
    this.localStorageService.set(AppConstants.KEY_WALLET_FAIO_ENABLED, this.enableFaio);
  }
}
