import { Component, OnInit, Input, HostListener, NgZone } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../../providers/wallet.service';
import { CSCCrypto } from '../../../../domains/csc-crypto';
import { CSCUtil } from '../../../../domains/csc-util';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import * as LokiTypes from '../../../../domains/lokijs';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';
import { WalletDefinition } from '../../../../domains/csc-types';

@Component({
  selector: 'wallet-step7',
  templateUrl: './step7.component.html',
  styleUrls: ['./step7.component.scss'],
})
export class Step7Component implements OnInit {

  statusMessage: string;
  defaultKeyPair: LokiTypes.LokiKey;
  setupFinished: boolean;
  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 6){
         this.zone.run(() => {
           this.initialize();
         });
       }
      });
  }

  @Input() slider: IonSlides;
    constructor(
      private zone: NgZone,
      private logger: LogService,
      private translate: TranslateService,
      private router: Router,
      private localStorageService: LocalStorageService,
      private sessionStorageService: SessionStorageService,
      private walletService: WalletService

    ) { }

    ngOnInit() {


    }
    swipeNext(){
      this.logger.debug('### Go to step 2 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideNext();
      this.slider.lockSwipes(true);
    }
    backToStart(){
      this.logger.debug('### Go to step 1 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideTo(1);
      this.slider.lockSwipes(true);
    }
    finishSetup(){
      this.logger.debug('### WalletSetup: ' + JSON.stringify(this.walletService.walletSetup.walletUUID));
      this.logger.debug('### WalletSetup - Create Wallet');
      this.translate.get('PAGES.SETUP.STEP7-STATUS-WALLET').subscribe((res: string) => {
        this.statusMessage = res;
      });
      // create the wallet
      this.walletService.createWallet().subscribe(createResult => {
        if (createResult === AppConstants.KEY_FINISHED) {
          this.logger.debug('### WalletSetup - Create new Account');
          // generate new account key pair
          const cscCrypto = new CSCCrypto(this.walletService.walletSetup.recoveryMnemonicWords, this.walletService.walletSetup.userEmail);
          const mnemonicHash = cscCrypto.getPasswordKey();
          this.logger.debug('### WalletSetup - mnemonicHash: ' + mnemonicHash);
          this.logger.debug('### Active - cryptparams Password: ' + this.walletService.walletSetup.userPassword + ' email: '+ this.walletService.walletSetup.userEmail);
        this.logger.debug('### Create result: ' + createResult + ' KEY_FINISHED: '+ AppConstants.KEY_FINISHED);
          const encMnemonicCscCrypto = new CSCCrypto(''+this.walletService.walletSetup.userPassword+'', this.walletService.walletSetup.userEmail);
          const encryptedMnemonicHash = encMnemonicCscCrypto.encrypt(mnemonicHash);
          const newKeyPair: LokiTypes.LokiKey = cscCrypto.generateKeyPair(0);
          if (newKeyPair.accountID.length > 0) {
            // save key to wallet
            this.walletService.addKey(newKeyPair);
            // create new account
            const walletAccount: LokiTypes.LokiAccount = {
              pk: ('CSC' + newKeyPair.accountID),
              accountID: newKeyPair.accountID,
              balance: '0',
              accountSequence: 0,
              currency: 'CSC',
              lastSequence: 0,
              label: 'Default CSC Account',
              tokenBalance: '0',
              activated: false,
              ownerCount: 0,
              lastTxID: '',
              lastTxLedger: 0
            };
            //save encrypted seed to db
            let crypto = new CSCCrypto(this.walletService.walletSetup.userPassword, this.walletService.walletSetup.userEmail);
            let encryptedMnemonicWords = crypto.encrypt(JSON.stringify(this.walletService.walletSetup.recoveryMnemonicWords));
            this.localStorageService.set(AppConstants.KEY_WALLET_MNEMONIC_WORDS, encryptedMnemonicWords);

            // save account to wallet
            this.walletService.addAccount(walletAccount);
            this.logger.debug('### WalletSetup - Encrypt Wallet Password');
            // save the wallet
            this.walletService.saveWallet();
            // generate password hash
            this.walletService.walletSetup.walletPasswordHash =
              this.walletService.generateWalletPasswordHash(
                this.walletService.walletSetup.walletUUID,
                this.walletService.walletSetup.userPassword
              );
            this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, this.walletService.walletSetup.walletPasswordHash);
            this.logger.debug('### WalletSetup - Encrypt Wallet Keys');
            // encrypt wallet keys
            this.walletService.encryptAllKeys(this.walletService.walletSetup.userPassword, this.walletService.walletSetup.userEmail).subscribe( result => {
              if (result === AppConstants.KEY_FINISHED) {
                this.logger.debug('### WalletSetup - Key Encryption Complete');
                // save the wallet
                this.walletService.saveWallet();
              }
            });
            // we are done
            this.setupFinished = true;
            this.logger.debug('### finishSetup() - setupFinished to true!!! ');
            this.translate.get('PAGES.SETUP.STEP7-FINISHED').subscribe((res: string) => {
              this.statusMessage = res;
            });

          } // end  newkeypair.accointId conditional

          const currentTimestamp: number = CSCUtil.iso8601ToCasinocoinTime(new Date().toISOString());
          this.logger.debug('### Current Timestamp CSC: ' + CSCUtil.casinocoinTimeToISO8601(currentTimestamp));
          const walletDefinition: WalletDefinition = {
            walletUUID: this.walletService.walletSetup.walletUUID,
            creationDate: currentTimestamp,
            location: this.walletService.walletSetup.walletLocation,
            network: (this.walletService.walletSetup.testNetwork ? 'TEST' : 'LIVE'),
            userEmail: this.walletService.walletSetup.userEmail,
            passwordHash: this.walletService.walletSetup.walletPasswordHash,
            mnemonicHash: encryptedMnemonicHash
          };
          let walletArray: Array<WalletDefinition> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
          if (walletArray == null) {
            // first wallet so init array
            walletArray = [];
          }
          walletArray.push(walletDefinition);
          this.localStorageService.set(AppConstants.KEY_AVAILABLE_WALLETS, walletArray);
          this.localStorageService.set(AppConstants.KEY_WALLET_LOCATION, this.walletService.walletSetup.walletLocation);
          this.localStorageService.set(AppConstants.KEY_BACKUP_LOCATION, this.walletService.walletSetup.backupLocation);
          this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, !this.walletService.walletSetup.testNetwork);
          this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, this.walletService.walletSetup.walletPasswordHash);
          // this.localStorageService.set(AppConstants.KEY_BRM_USER, this.walletService.walletSetup.userName);
          this.localStorageService.set(AppConstants.KEY_SETUP_COMPLETED, true);
          // set session data
          this.sessionStorageService.set(AppConstants.KEY_CURRENT_WALLET, walletDefinition);
          this.sessionStorageService.set(AppConstants.KEY_WALLET_PASSWORD, this.walletService.walletSetup.userPassword);
          // Close dialog and wallet setup and go to Home screen
          this.logger.debug('### Setup Finished');
          this.logger.debug('### walletArray Status: ' + JSON.stringify(walletArray) );


        } //end createResult conditional

      });//end create wallet.
    }
    initialize(){
      this.logger.debug('### OnInit: Step 7');
      this.setupFinished = false;
      this.translate.get('PAGES.SETUP.STEP7-STATUS-FINALIZING').subscribe((res: string) => {
        this.statusMessage = res;
        const finishTimer = timer(100);
        finishTimer.subscribe(val => this.finishSetup());
      });

      this.logger.debug('### Ready last step. Wallet Setup ');

    }
    closeSetup() {
      this.router.navigate(['/']);
    }
}
