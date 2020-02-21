import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges, NgZone } from '@angular/core';
import { LogService } from '../../providers/log.service';
import { WalletService } from '../../providers/wallet.service';
import { AppflowService } from '../../providers/appflow.service';
import { LoadingController, AlertController, IonInput} from '@ionic/angular';
import { timer, Subscription } from 'rxjs';
import { CSCUtil } from '../../domains/csc-util';
import { FingerprintAIO, FingerprintOptions } from '@ionic-native/fingerprint-aio/ngx';
import { CSCCrypto } from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WalletDefinition } from '../../domains/csc-types';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {  MenuController } from '@ionic/angular';



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
  theme: string;
  pinCtl: IonInput;
  encryptedPIN:string;
  returnUrl: string;
  footer_visible = false;
  error_message: string;
  errorMessageList: string[];
  displayCustomPin = false;
  displayKbPin = false;
  defaultAccount: string;
  loginDisable = false;
  loginEntry = false;
  enteredPinCode = "";
  timer: any;
  quitFromLogin = false;
  loginFinished = false;
  quitListener: Subscription;
  fingerprintOptions:FingerprintOptions;
  update_dialog_visible = false;
  autoUpdateRunning = false;
  downloadedBytes = 0;
  totalBytes = 0;
  downloadPercentage: number;
  downloadVersion = '';
  downloadCompleted = false;
  public availableWallets: Array<WalletDefinition>;
  versionNumber = '';

  constructor(
      public logger: LogService,
      private route: ActivatedRoute,
      private router: Router,
      private loading: LoadingController,
      private alertCtrl: AlertController,
      private statusBar: StatusBar,
      private faio: FingerprintAIO,
      private zone: NgZone,
      private walletService: WalletService,
      public appflow: AppflowService,
      public menuCtrl: MenuController,
      private datePipe: DatePipe,
      private translate: TranslateService,
      private decimalPipe: DecimalPipe,
      public sessionStorageService: SessionStorageService,
      public localStorageService: LocalStorageService

    ) {
      this.defaultAccount = this.localStorageService.get(AppConstants.KEY_WALLET_PASSWORD_HASH);
      this.logger.debug('### LoginComponent constructor default acc:'+this.defaultAccount);
      this.statusBar.styleLightContent();
    }
  @ViewChild('test', { static:false }) set content(content: IonInput) {
    this.pinCtl = content;
 }
// @ViewChild('test', { static:false }) pinCtl: ElementRef;
  ngOnInit() {
    this.versionNumber = this.appflow.versionNumber;
    this.logger.debug('### LoginComponent onInit version number:'+this.versionNumber);

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
    // if (this.appflow.walletSettings.walletLanguage){
    //   this.translate.getTranslation(this.appflow.walletSettings.walletLanguage);
    // }else{
    //
    // }
      // this.translate.use("en");
    this.translate.get('PAGES.LOGIN.ERRORS').subscribe((res:any) => {
        this.errorMessageList = res;
        this.logger.debug('### Errors list res: ' + JSON.stringify(res));
        this.logger.debug('### Errors list: ' + JSON.stringify(this.errorMessageList));
    });
    this.walletEmail = this.selectedWallet.userEmail;

  }
  async enterPIN(){
    setTimeout(() => {
      console.log("PIN CTL####################",this.pinCtl);
      // this.pinCtl.setFocus();
      // this.pinCtl.setFocus();
      // this.pinCtl.el["autofocus"] = true;

    });
    // WIP ::: this is for the fingerprint. It will be ready soon!!!
    const usebiometrics = !!(this.localStorageService.get(AppConstants.KEY_WALLET_ENCRYPTED_PIN) && (this.localStorageService.get(AppConstants.KEY_WALLET_ENCRYPTED_PIN) !== ""));
    if (usebiometrics){
      this.encryptedPIN = this.localStorageService.get(AppConstants.KEY_WALLET_ENCRYPTED_PIN);
       console.log("params for crypto",this.selectedWallet.mnemonicHash, this.walletEmail);
       console.log("CPIN",this.encryptedPIN);
       let cscCrypto = new CSCCrypto(this.selectedWallet.mnemonicHash, this.walletEmail);
       console.log("Cryp",this.encryptedPIN);
       this.enteredPinCode = cscCrypto.decrypt(this.encryptedPIN);
       console.log("PIN",this.enteredPinCode);
       this.fingerprintOptions = {
           title: 'Token Wallet XXX',
           subtitle: 'CasinoCoin', //Only necessary for Android
           description: 'Provide your authentication via fingerprint',
           fallbackButtonTitle: 'Use PIN Instead',
           // disableBackup:true  //Only for Android(optional)
       }
       this.faio.isAvailable().then(result =>{
         console.log('RESULT',result);
       if(result === "finger" || result == "face")
       {
           this.faio.show(this.fingerprintOptions)
           .then((result: any) => {
             console.log("FAIO",result);
             if(result === "biometric_success" || result == "Success" ){
               // this.zone.run(() => {
                 this.enteredPinCode = cscCrypto.decrypt(this.encryptedPIN);
                 console.log("Cryp",this.encryptedPIN);
                 console.log("PIN",this.enteredPinCode);
                 this.validatePincode();
               // });
             }

           })
           .catch(async (error: any) => {
             this.error_message = this.errorMessageList['IMPOSSIBLE'] + error;
             let alert = await this.alertCtrl.create({
               header: 'ERROR',
               subHeader: this.error_message,
               buttons: ['Dismiss']
             });
             console.log(error);
             await alert.present();
             });
           }
       }).catch(async (error: any) => {
         this.error_message = this.errorMessageList['IMPOSSIBLE'] + error.message;
         let alert = await this.alertCtrl.create({
           header: 'ERROR',
           subHeader: this.error_message,
           buttons: [
             {
               text: 'Use Pin',
               role: 'pin',
               cssClass: 'secondary',
               handler: (data) => {
                 this.logger.debug("### Log In Page:: Use another method");
                 this.enteredPinCode = "";
                 this.localStorageService.set(AppConstants.KEY_WALLET_ENCRYPTED_PIN,"");
                 this.localStorageService.set(AppConstants.KEY_WALLET_FAIO_ENABLED, false);
                 this.showCustomPin();
                 // console.log(this);
               }
             }, {
               text: 'Ok',
               handler: (data) => {
                 this.logger.debug("### Log In Page:: OK");

               }
             }

           ]
         });
         console.log(error);
         await alert.present();
        });



    }else{
      console.log("WE REACHED HERE");

      if(this.appflow.walletSettings.enableOSKB){
        console.log("AND HERE");
         this.displayKbPin = true;

         console.log("PINCTL",this.pinCtl);
         this.focusPIN();
       }else{
         console.log("AND THERE");
         this.displayCustomPin = true;
       }
    }
    // if (this.localStorageService.get(AppConstants.KEY_WALLET_ENCRYPTED_PIN)){
    //   this.encryptedPIN = this.localStorageService.get(AppConstants.KEY_WALLET_ENCRYPTED_PIN);
    //   console.log("params for crypto",this.defaultAccount, this.walletEmail);
    //   let cscCrypto = new CSCCrypto(this.defaultAccount, this.walletEmail);
    //   this.enteredPinCode = cscCrypto.decrypt(this.encryptedPIN);
    //
    // }else{
    //   this.enteredPinCode = "123456";
    //   console.log("params for crypto",this.defaultAccount, this.walletEmail);
    //   let cscCrypto = new CSCCrypto(this.defaultAccount, this.walletEmail);
    //   this.encryptedPIN =  cscCrypto.encrypt(this.enteredPinCode);
    //   this.localStorageService.set(AppConstants.KEY_WALLET_ENCRYPTED_PIN,this.encryptedPIN);
    // }

    //
  }
  focusPIN(){
    setTimeout(() => {
      if(this.pinCtl){

        // this.zone.run(() => {
          //
          //   // this.pinCtl.setFocus();
          //   this.pinCtl.autoFocus = true;
          // });
          this.pinCtl.setFocus();
        }
    }, 200);
  }
  recoverWallet(){
    // this.localStorageService.remove(AppConstants.KEY_SETUP_COMPLETED);
    this.router.navigate(['/recover-mnemonic']);
  }
  ionViewWillEnter(){
    this.menuCtrl.enable(false);
    this.theme = this.appflow.dark ? "dark":"light";
    this.enteredPinCode = "";

  }
  ngAfterViewInit() {

    this.logger.debug("##### Log in Page: Appflow is logged in?: "+ this.appflow.loggedIn);
    if(this.appflow.loggedIn){
      if(this.appflow.walletSettings.enableOSKB){
        this.displayKbPin = true;
      }else{
        this.displayCustomPin = true;
      }

      // this.loginEntry = false;
    }else{
      if(this.appflow.walletSettings.enableOSKB){
        this.displayKbPin = false;
      }else{

        this.displayCustomPin = false;
      }
      // this.loginEntry = true;

    }
    this.logger.debug("##### Log in Page: is OSKB ENABLED?: "+ this.appflow.walletSettings.enableOSKB);
    this.logger.debug("##### Log in Page: is displayCustomPin enabled?: "+ this.displayKbPin);
    this.logger.debug("##### Log in Page: is displayKbPin enabled?: "+ this.displayCustomPin);
  }
  ionViewDidLeave(){
    this.menuCtrl.enable(true);
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
  handlePinKb(evt){
    this.enteredPinCode = evt.detail.value;
    this.logger.debug("##### Log in Page: Entered PIN: "+ this.enteredPinCode);
    if (this.enteredPinCode.length === 6) {
      this.logger.debug("##### Log in Page: Validate PIN ");
      this.validatePincode();
    }
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
                       this.sessionStorageService.set(AppConstants.KEY_WALLET_PASSWORD, this.enteredPinCode);
                       this.localStorageService.set(AppConstants.KEY_WALLET_LOCATION, this.selectedWallet.location);
                       if (this.selectedWallet.network === 'LIVE') {
                           this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, true);
                           this.appflow.network = 'CSCSLIVE';
                       } else {
                           this.localStorageService.set(AppConstants.KEY_PRODUCTION_NETWORK, false);
                           this.appflow.network = 'TESTNET';
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
                       this.focusPIN();
                       // this.cancelPin();



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
    if(this.pinCtl){
      if(this.enteredPinCode.length > 5){
        return true;
      }else{
        this.enteredPinCode = "";
        this.displayCustomPin = false;
        this.displayKbPin = false;
        this.loginDisable = false;
      }
      // this.zone.run(() => {
      //
      //   // this.pinCtl.setFocus();
      //   this.pinCtl.autoFocus = true;
      // });

    }
    this.enteredPinCode = "";
    this.displayCustomPin = false;
    this.displayKbPin = false;
    this.loginDisable = false;
  }
  showCustomPin() {
    // this.displayKbPin = true;
    this.focusPIN();
    if(this.appflow.walletSettings.enableOSKB){
      this.displayKbPin = true;

    }else{
      this.displayCustomPin = true;
    }

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
