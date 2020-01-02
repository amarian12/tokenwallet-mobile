import { Component, OnInit } from '@angular/core';
import { LogService } from '../../providers/log.service';
import { WalletService } from '../../providers/wallet.service';
import { AppflowService } from '../../providers/appflow.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { timer, Subscription } from 'rxjs';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto } from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WalletDefinition } from '../../domains/csc-types';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  selectedWallet: WalletDefinition;
  walletPassword: string;
  walletCreationDate: string;
  walletEmail: string;
  wallets: any[] = [];

  returnUrl: string;
  footer_visible = false;
  error_message: string;
  errorMessageList: string[];
  displayCustomPin = false;
  defaultAccount: string;
  loginDisable = false;
  loginEntry = false;
  enteredPinCode = "";
  timer: any;
  quitFromLogin = false;
  loginFinished = false;
  quitListener: Subscription;

  update_dialog_visible = false;
  autoUpdateRunning = false;
  downloadedBytes = 0;
  totalBytes = 0;
  downloadPercentage: number;
  downloadVersion = '';
  downloadCompleted = false;
  public availableWallets: Array<WalletDefinition>;

  constructor(
      public logger: LogService,
      private route: ActivatedRoute,
      private router: Router,
      private loading: LoadingController,
      private alertCtrl: AlertController,
      private statusBar: StatusBar,
      private walletService: WalletService,
      private appflow: AppflowService,
      private datePipe: DatePipe,
      private translate: TranslateService,
      private decimalPipe: DecimalPipe,
      public sessionStorageService: SessionStorageService,
      public localStorageService: LocalStorageService

    ) {
      this.defaultAccount = this.localStorageService.get(AppConstants.KEY_DEFAULT_ACCOUNT_ID);
      this.statusBar.styleLightContent();
    }

  ngOnInit() {
    this.logger.debug('### LoginComponent onInit');
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // get available wallets (we switched to a single wallet for WLT wallet)
    this.availableWallets = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    if (this.availableWallets === null) {
        this.selectedWallet = { walletUUID: '', creationDate: -1, location: '', mnemonicHash: '', network: '', passwordHash: '', userEmail: ''};
        this.router.navigate(['/wallet-setup']);
    } else if (this.availableWallets.length >= 1) {
        this.logger.debug('### LOGIN Wallet Count: ' + this.availableWallets.length);
        for (let i = 0; i < this.availableWallets.length; i++) {
            this.logger.debug('### LOGIN Wallet: ' + JSON.stringify(this.availableWallets[i]));
            let walletLabel = this.availableWallets[i]['walletUUID'].substring(0, 12);
            const creationDate = new Date(CSCUtil.casinocoinToUnixTimestamp(this.availableWallets[i]['creationDate']));
            walletLabel = walletLabel + '... [Created: ' + this.datePipe.transform(creationDate, 'yyyy-MM-dd') + ']';
            if (this.availableWallets[i]['network']) {
                walletLabel = walletLabel + ' ' + this.availableWallets[i]['network'];
            }
            this.logger.debug('### LOGIN Wallet Label: ' + walletLabel);
            this.wallets.push({label: walletLabel, value: this.availableWallets[i]['walletUUID']});
        }
    }
    // set last wallet as selected
    this.selectedWallet = this.availableWallets[this.availableWallets.length - 1];
    const walletCreationDate = new Date(CSCUtil.casinocoinToUnixTimestamp(this.selectedWallet.creationDate));
    this.translate.get('PAGES.LOGIN.CREATED-ON').subscribe((res: string) => {
        this.walletCreationDate = res + ' ' + this.datePipe.transform(walletCreationDate, 'yyyy-MM-dd HH:mm:ss');
    });
    this.translate.get('PAGES.LOGIN.ERRORS').subscribe((res: string[]) => {
        this.errorMessageList = res;
        this.logger.debug('### Errors list: ' + JSON.stringify(this.errorMessageList));
    });
    this.walletEmail = this.selectedWallet.userEmail;

  }
  enterPIN(){
    this.displayCustomPin = true;
  }
  forgotPin(){
    this.router.navigate(['/wallet-setup']);
  }
  ionViewWillEnter(){
    if(this.appflow.loggedIn){
      this.displayCustomPin = true;
      // this.loginEntry = false;
    }else{
      this.displayCustomPin = false;
      // this.loginEntry = true;

    }
  }
  verifyPinAndLogin(decryptedPIN) {


    // this.loader.setContent("Decrypting Wallet");
    // this.walletService.walletPIN = decryptedPIN;
    // let userObject: User = this.localStorageService.get(AppConstants.KEY_BRM_USER);
    // this.walletService.openWallet(this.walletUUID).subscribe( result => {
    //   if(result == AppConstants.KEY_LOADED){
    //     let accountKey: LokiKey = this.walletService.getKey(userObject.AccountID);
    //     if (accountKey.encrypted) {
    //       accountKey.encrypted = false;
    //       accountKey.secret = this.walletService.getDecryptSecret(decryptedPIN, accountKey);
    //     }
        // this.loader.setContent("Authenticating. Please wait...");
        // this.brmService.loginUser(accountKey).subscribe(result => {
        //   this.logger.debug("Logged in: " + result);
        //   if(result == AppConstants.KEY_FINISHED){
        //     // // encrypt secret key
        //     // this.walletService.encryptSecretKey(decryptedPIN);
        //     // // get the current operators
        //     // this.brmService.updateCurrentOperators();
        //     // this.brmService.updateCurrentUser();
        //     // this.webSocketService.connectToBrmWebsocket();
        //     this.loader.dismiss();
        //     // let msg: NotificationType = {severity: SeverityType.info, title:'Wallet Message', body:'Successfully opened the wallet.'};
        //     // this.notificationService.addMessage(msg);
        //     let toast = this.toastCtrl.create({
        //       message: "Successfully opened the wallet.",
        //       duration: 2000,
        //       position: 'top'
        //     });
        //     toast.present();
        //     this.navCtrl.setRoot(HomePage);
        //   } else if (result == AppConstants.KEY_ERRORED) {
        //     this.loader.dismiss();
        //     this.cancelPin();
        //   }
        // });
    //   }
    // });
  }
  handlePinInput(pin:string){
    this.enteredPinCode += pin;
    this.logger.debug("##### Log in Page: Entered PIN: "+ this.enteredPinCode);
    if (this.enteredPinCode.length === 6) {
      this.logger.debug("##### Log in Page: Validate PIN ");
      this.validatePincode();
    }
  }
  backspacePin() {
    this.enteredPinCode = this.enteredPinCode.substring(0, this.enteredPinCode.length - 1);
    this.logger.debug("##### Log in Page: Entered PIN: "+ this.enteredPinCode);
  }
  validatePincode() {
    if(this.enteredPinCode.length === 6){
      // this.pinCodeViewChild.setBlur();
      // this.loader = this.loader.create({spinner: 'crescent', content: 'Validating PIN', duration: 60000});
      this.loading
      .create({
        keyboardClose:true,
        message:this.errorMessageList['VALIDATINGPIN']
      })
      .then( loading => {
         loading.present().then( async () => {
           // setTimeout(() => {
           this.logger.debug('### Login Page ::: OpenWallet: ' + JSON.stringify(this.selectedWallet));
           if (this.enteredPinCode == null || this.enteredPinCode.length === 0) {

               this.error_message = this.errorMessageList['IMPOSSIBLE'];


           } else {

               const finishTimer = timer(1000);
               finishTimer.subscribe( async val => {
                   this.logger.debug('### LoginComponent - Check Wallet Password ###');
                   if (this.walletService.checkWalletPasswordHash(this.enteredPinCode, this.selectedWallet.walletUUID, this.selectedWallet.passwordHash)) {
                       this.logger.debug('### checkWalletHash: OK');
                       this.loginFinished = true;
                       // const walletIndex = this.availableWallets.findIndex( item => item['walletUUID'] === this.selectedWallet);
                       this.sessionStorageService.set(AppConstants.KEY_CURRENT_WALLET, this.selectedWallet);
                       this.sessionStorageService.set(AppConstants.KEY_WALLET_PASSWORD, this.walletPassword);
                       this.localStorageService.set(AppConstants.KEY_WALLET_LOCATION, this.selectedWallet.location);
                       if (this.selectedWallet.network === 'LIVE') {
                           this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, true);
                       } else {
                           this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, false);
                       }
                       this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, this.selectedWallet.passwordHash);

                       this.walletService.openWallet(this.selectedWallet.walletUUID);
                       this.appflow.authCorrect = true;
                       // if(!this.appflow.loggedIn){
                       //   this.appflow.loggedIn = true;
                       // }
                       this.router.navigate(['/']);



                       this.error_message = '';

                   } else {
                       // Invalid Wallet Password !!!

                       this.error_message = this.errorMessageList['INVALIDPIN'];
                   }
                   if(this.error_message  == ""){
                     this.loading.dismiss();
                     return;
                   }else {
                     this.loading.dismiss();
                     this.logger.debug('### will throw alert: '+this.error_message);
                     let alert = await this.alertCtrl.create({
                       header: 'ERROR',
                       subHeader: this.error_message,
                       buttons: ['Dismiss']
                     });
                     await alert.present();

                     await alert.onDidDismiss().then(() => {
                       this.enteredPinCode = "";
                       this.showCustomPin();
                       // setTimeout(() => {
                       //   this.pinCodeViewChild.setFocus();
                       // }, 200);
                     });
                   }
               });

           // }, 300);
            }
         });
       });
    }
  }
  cancelPin() {
    this.enteredPinCode = "";
    this.displayCustomPin = false;
    this.loginDisable = false;
  }
  showCustomPin() {
    this.displayCustomPin = true;
    // let modal = this.modalCtrl.create(CustomPinComponent, { pageTitle: "Enter PIN code" });
    // modal.present();
    // modal.onDidDismiss(data => {
    //   if(data) {
    //     this.enteredPinCode = data;
    //     this.validatePincode();
    //   }
    // });
  }

}
