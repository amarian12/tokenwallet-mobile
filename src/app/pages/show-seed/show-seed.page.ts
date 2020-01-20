import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { WalletService } from '../../providers/wallet.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto } from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
import { LogService } from '../../providers/log.service';
import { BehaviorSubject } from 'rxjs';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { AppflowService } from '../../providers/appflow.service';
import { LokiKey, LokiAccount, LokiTransaction, LokiTxStatus } from '../../domains/lokijs';
import { WalletDefinition } from '../../domains/csc-types';
import { TranslateService } from '@ngx-translate/core';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-show-seed',
  templateUrl: './show-seed.page.html',
  styleUrls: ['./show-seed.page.scss'],
})
export class ShowSeedPage implements OnInit {
  selectedWallet: any;
  theme:string;
  walletLocation: string;
  walletTestNetwork: boolean;
  networkChoice = 'LIVE';
  slideOpts = {};
  returnUrl: string;
  footer_visible = false;
  error_message: string;
  odds:Array<string>;
  evens:Array<string>;
  words = {
    w1:"",
    w2:"",
    w3:"",
    w4:"",
    w5:"",
    w6:"",
    w7:"",
    w8:"",
    w9:"",
    w10:"",
    w11:"",
    w12:""
  };
  walletEmail: string;
  walletPassword: string;
  confirmWalletPassword: string;
  walletRecoveryEnabled = false;
  paswordConfirmationEnabled = false;
  passwordsEqual = false;
  maxActNotFound = 5;


  constructor( private logger: LogService,
                private route: ActivatedRoute,
                private router: Router,
                private alert: AlertController,
                private translate: TranslateService,
                private walletService: WalletService,
                private casinocoinService: CasinocoinService,
                private appflow: AppflowService,
                private loading: LoadingController,
                private localStorageService: LocalStorageService,

                private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
  }
  cancel() {
      this.logger.debug('### Show Seed Page - Cancel ###');
      this.router.navigate(['tabs/dashboard/settings']);
  }
  async ionViewWillEnter(){
    this.theme = this.appflow.dark ? "dark":"light";
    const result = await this.appflow.onValidateTx("addCSCAccount","Enter your PIN to access your seed words",this.theme, undefined);
    if(result && result.data.state){
      this.selectedWallet = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
      this.walletEmail = this.selectedWallet.userEmail;
      const mainAccount = this.walletService.getMainAccount();
      const encryptedMnemonicWords = this.localStorageService.get(AppConstants.KEY_WALLET_MNEMONIC_WORDS);
      let crypto = new CSCCrypto(mainAccount.accountID, this.walletEmail );
      this.logger.debug('### Show seed: encwords ' + JSON.stringify(encryptedMnemonicWords));
      this.logger.debug('### Show seed: main account  ' + JSON.stringify(mainAccount));
      let decryptedWords = JSON.parse(crypto.decrypt(encryptedMnemonicWords));
      this.logger.debug('### Show seed: decryptedMnemonicWords' + JSON.stringify(decryptedWords));
      this.odds = [];
      this.evens = [];
      const arr = decryptedWords;
      if(arr){
        for (var i = 0 ; i < arr.length; i++){
          if(i%2 == 0){
            // take into account that 0 is the 1 element
            // that's why odd and even is swapped
            this.odds[i] = arr[i];
          }else{
            this.evens[i] = arr[i];

          }
        }
        this.odds = this.odds.filter(Boolean);
        this.evens = this.evens.filter(Boolean);
      }
    }else{
      this.cancel();
    }

    }
}
