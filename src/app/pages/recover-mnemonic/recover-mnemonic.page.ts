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
  selector: 'app-recover-mnemonic',
  templateUrl: './recover-mnemonic.page.html',
  styleUrls: ['./recover-mnemonic.page.scss'],
})
export class RecoverMnemonicPage implements OnInit {
  selectedWallet: string;
  walletLocation: string;
  walletTestNetwork: boolean;
  networkChoice = 'LIVE';
  slideOpts = {};
  returnUrl: string;
  footer_visible = false;
  error_message: string;

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
  recoveryEmail: string;
  walletPassword: string;
  confirmWalletPassword: string;
  walletRecoveryEnabled = false;
  paswordConfirmationEnabled = false;
  passwordsEqual = false;
  maxActNotFound = 5;

  @ViewChild('recoverFromWords', { static: true }) slides: IonSlides;
  // passwordPattern = '(?=.*[0-9])(?=.*[a-z]).{8,}';
  constructor(  private logger: LogService,
                private route: ActivatedRoute,
                private router: Router,
                private alert: AlertController,
                private translate: TranslateService,
                private walletService: WalletService,
                private casinocoinService: CasinocoinService,
                private appflow: AppflowService,
                private loading: LoadingController,
                private localStorageService: LocalStorageService,

                private sessionStorageService: SessionStorageService
) { }
removeUndefined(obj: Object): Object {
    // return _.omit(obj, _.isUndefined)
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
}
slideChanged() {
console.log(this.slides.getActiveIndex());
}
next(form){
  this.logger.debug('### Go to step 2 triggered');
  let error = "";
    if (!form.value.word1 || !form.value.word2 || !form.value.word3 || !form.value.word4 || !form.value.word5 || !form.value.word6 || !form.value.word7 || !form.value.word8 || !form.value.word9 || !form.value.word10 || !form.value.word11 || !form.value.word12) {
      this.logger.debug('### RecoverMnemonic ERROR you need to input all 12 words');
      error += "you need to input all 12 words, \n";
    }else{
      for(let i = 1; i<=12; i++){
        if(!CSCCrypto.isExistingWord(form.value['word'+i].trim().toLowerCase())){
          error+=" word "+i+" is not a valid word, \n,";
        }
      }
    }
    if (!form.value.email) {
      this.logger.debug('### RecoverMnemonic ERROR you need to enter an email');
      error += "you need to enter an email, \n";
    }else{
      if(form.controls.email.invalid){
        this.logger.debug('### RecoverMnemonic ERROR you need to enter a valid email');
        error += "you need to enter a valid email, \n";
      }
    }

    const errorMessage = {
      header:"Error",
      subheader:"Form Validation",
      message:error,
      okbtn:'OK'
    }
    if(error === ""){
      this.slides.lockSwipes(false);
      this.slides.slideNext();
      this.slides.lockSwipes(true);

    }else{
      this.displayError(errorMessage);
      console.log(form);
      return false;

    }

}
back(){
  this.logger.debug('### Go to step 1 triggered');
  this.slides.lockSwipes(false);
  this.slides.slidePrev();
  this.slides.lockSwipes(true);
}
  recover(){
    let message = "processing recovery";
    let error = "";
    console.log(this.words);
    this.loading
    .create({
      keyboardClose:true,
      message:message
    })
    .then( loading => {
       loading.present().then( async () => {
         this.logger.debug('### Recover with words: ' + JSON.stringify(this.words));
         this.casinocoinService.recoveryInProgress = true;
         this.logger.debug('### Network: ' + this.networkChoice);
         if (this.networkChoice === 'TEST') {
             this.walletTestNetwork = true;
         } else {
             this.walletTestNetwork = false;
         }
         const recoveryArray = [];
         recoveryArray.push([this.words.w1.trim().toLowerCase(),
                             this.words.w2.trim().toLowerCase(),
                             this.words.w3.trim().toLowerCase(),
                             this.words.w4.trim().toLowerCase(),
                             this.words.w5.trim().toLowerCase(),
                             this.words.w6.trim().toLowerCase(),
                             this.words.w7.trim().toLowerCase(),
                             this.words.w8.trim().toLowerCase(),
                             this.words.w9.trim().toLowerCase(),
                             this.words.w10.trim().toLowerCase(),
                             this.words.w11.trim().toLowerCase(),
                             this.words.w12.trim().toLowerCase()
                           ]);
         // recover the wallet
         const cscCrypto = new CSCCrypto(recoveryArray, this.recoveryEmail);
         const walletUUID = UUID.UUID();
         this.walletService.walletSetup = {
             userEmail: this.recoveryEmail.trim().toLowerCase(),
             userPassword: this.walletPassword,
             recoveryMnemonicWords: recoveryArray,
             testNetwork: this.walletTestNetwork,
             walletUUID: walletUUID,
             walletPasswordHash: this.walletService.generateWalletPasswordHash(walletUUID, this.walletPassword),
             walletLocation: ''
         };
         const mnemonicHash = cscCrypto.getPasswordKey();
         this.logger.debug('### Recover - mnemonicHash: ' + mnemonicHash);
         const encMnemonicCscCrypto = new CSCCrypto(this.walletService.walletSetup.userPassword, this.walletService.walletSetup.userEmail);
         const encryptedMnemonicHash = encMnemonicCscCrypto.encrypt(mnemonicHash);
         this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, this.walletService.walletSetup.walletPasswordHash);
         this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, !this.walletService.walletSetup.testNetwork);
         // regenerate accounts
         const accountFindFinishedSubject = new BehaviorSubject<Boolean>(false);
         let sequence = 0;
         let actNotFoundCount = 0;
         let accountsFoundFinished = false;
         let forgroundRecoveryFinished = false;
         let emptyAccountSequences = [];
         let resultMessage;
        //  // connect to a daemon
        //  const cscSubscription = this.casinocoinService.connect().subscribe( result => {
        //      if (result === AppConstants.KEY_CONNECTED) {
                 this.logger.debug('### Recover - Create new Wallet ###');
                 this.walletService.createWallet().subscribe( createResult => {
                     if (createResult === AppConstants.KEY_FINISHED) {
                          // save wallet info
                          const currentTimestamp: number = CSCUtil.iso8601ToCasinocoinTime(new Date().toISOString());
                          this.logger.debug('### Recover - Current Timestamp CSC: ' + CSCUtil.casinocoinTimeToISO8601(currentTimestamp));
                          const walletDefinition: WalletDefinition = {
                              walletUUID: this.walletService.walletSetup.walletUUID,
                              creationDate: currentTimestamp,
                              location: this.walletService.walletSetup.walletLocation,
                              network: (this.walletService.walletSetup.testNetwork ? 'TEST' : 'LIVE'),
                              userEmail: this.walletService.walletSetup.userEmail,
                              passwordHash: this.walletService.walletSetup.walletPasswordHash,
                              mnemonicHash: encryptedMnemonicHash
                          };
                          this.sessionStorageService.set(AppConstants.KEY_CURRENT_WALLET, walletDefinition);
                          let walletArray: Array<WalletDefinition> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
                          if (walletArray == null) {
                              // first wallet so init array
                              walletArray = [];
                          }
                          walletArray.push(walletDefinition);
                          this.localStorageService.set(AppConstants.KEY_AVAILABLE_WALLETS, walletArray);
                          this.localStorageService.set(AppConstants.KEY_WALLET_LOCATION, this.walletService.walletSetup.walletLocation);
                          this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, this.walletService.walletSetup.walletPasswordHash);
                          this.localStorageService.set(AppConstants.KEY_SETUP_COMPLETED, true);
                          // set server based on network
                          if(this.walletService.walletSetup.testNetwork){
                              this.casinocoinService.currentServerURL =  'wss://wst01.casinocoin.org:4443';
                          } else {
                              this.casinocoinService.currentServerURL = 'wss://ws01.casinocoin.org:4443';
                          }
                          // listen for account updates
                          const accountSubscription = this.casinocoinService.accountSubject.subscribe( foundAccount => {
                              this.logger.debug('### Recover - foundAccount: ' + JSON.stringify(foundAccount));
                              if(foundAccount.accountSequence !== undefined && foundAccount.accountSequence === 0 && accountsFoundFinished === false){
                                  // we found our first account, save it and go to the dashboard
                                  this.logger.debug('### Recover - First Account Found, Save and Finish');
                                  accountsFoundFinished = true;
                                  if(foundAccount.activated === true) {
                                    resultMessage = 'Account found, recovery will continue in the background';
                                  } else {
                                    resultMessage = 'First recovery Account is not activated, seed might be invalid!';
                                  }
                              } else if(foundAccount.accountSequence && foundAccount.accountSequence > 0){
                                this.logger.debug('### Recover - Account Found, Save it');
                              } else {
                                  // No accounts found !
                                  resultMessage = 'No accounts could be restored during recover.';
                                  accountsFoundFinished = false;
                              }
                              if(accountsFoundFinished && !forgroundRecoveryFinished){
                                    forgroundRecoveryFinished = true;
                                    // save the wallet
                                    this.walletService.saveWallet();
                                    // unsubscribe from account updates
                                    accountSubscription.unsubscribe();
                                    // dismiss loader
                                    this.loading.dismiss();
                                    this.alert.create({
                                      header: 'Recovery',
                                      message: resultMessage,
                                      buttons: [
                                        {
                                          text: 'Ok',
                                          handler: () => {
                                            // set loggedIn and authCorrect
                                            this.appflow.loggedIn = true;
                                            this.appflow.authCorrect = true;
                                            // navigate user to Home replacing history
                                            this.router.navigateByUrl('/',{ replaceUrl: true })

                                        }
                                      }
                                    ]
                                    }).then( alert =>  {
                                      alert.present();
                                    });
                                }
                          });
                          // execute the account refresh
                          this.casinocoinService.refreshAccounts(this.recoveryEmail, this.walletPassword);
                     }
                 });
        //      }else{
        //        error = "Error not connected";
        //      }
        //  });
       });
     });


  }
  ionViewWillEnter(){
    const availableWallets: Array<any> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    if (availableWallets != null &&  availableWallets.length >= 1) {
      this.showWarning();
    }
  }
  cancel() {
      this.logger.debug('### RecoverMnemonic - Cancel ###');
      this.router.navigate(['login']);
  }
  ngOnInit() {
    this.slideOpts= AppConstants.SLIDE_CUBE_EFFECT;
    this.slides.lockSwipes(true);
    this.logger.debug('### INIT Recover Mnemonics ###');
    this.logger.debug('### RecoverMnemonic onInit');
    // get return url from route parameters or default to '/'
    this.selectedWallet = this.route.snapshot.queryParams['walletUUID'];
    this.walletLocation = this.route.snapshot.queryParams['walletLocation'];
    this.walletTestNetwork = false;
    this.logger.debug('### RecoverMnemonic for: ' + this.selectedWallet + ' and path: ' + this.walletLocation);
    this.error_message = '';
  }
  onSubmit(form){

    let error = "";
    if(form.form.status == "INVALID"){
      if (!form.value.word1 || !form.value.word2 || !form.value.word3 || !form.value.word4 || !form.value.word5 || !form.value.word6 || !form.value.word7 || !form.value.word8 || !form.value.word9 || !form.value.word10 || !form.value.word11 || !form.value.word12) {
        this.logger.debug('### RecoverMnemonic ERROR you need to input all 12 words');
        error += "you need to input all 12 words, \n";
      }else{
        for(let i = 1; i<=12; i++){
          if(!CSCCrypto.isExistingWord(form.value['word'+i].trim().toLowerCase())){
            error+=" word "+i+" is not a valid word, \n,";
          }
        }
      }
      if (!form.value.email) {
        this.logger.debug('### RecoverMnemonic ERROR you need to enter an email');
        error += "you need to enter an email,\n";
      }
      if (!form.value.pin) {
        this.logger.debug('### RecoverMnemonic ERROR you need to enter PIN');
        error += "you need to enter a PIN\n";
      }else{
        if ( form.value.pin.length != 6 ) {
          this.logger.debug('### RecoverMnemonic PIN should be 6 digits');
          error += "PIN should be 6 digits,\n";

        }
      }
      if (!form.value.pinconfirm) {
        this.logger.debug('### RecoverMnemonic ERROR you need to enter PIN again');
        error += "you need to enter PIN again,\n";

      }
      if (form.value.pinconfirm != form.value.pin) {
        this.logger.debug('### RecoverMnemonic both pins should be equal');
        error += "both pins should be equal,\n";

      }
      const errorMessage = {
        header:"Error",
        subheader:"Form Validation",
        message:error,
        okbtn:'OK'
      }
      this.displayError(errorMessage);
      console.log(form.form);
      return false;
    }

    this.recover();
  }
  displayError(error){
    this.alert.create({

        header: error.header,
        subHeader: error.subheader,
        message: error.message,
        buttons: [
          {
            text: error.okbtn,
            role: 'ok',
            cssClass: 'secondary',
            handler: () => {
              this.alert.dismiss();
            }
          }
        ]
      }).then( alert =>  {
           return alert.present();
      });
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

}
