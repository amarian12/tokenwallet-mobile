import { Component, OnInit, Input } from '@angular/core';
import { LogService } from '../../../providers/log.service';
import { WalletService } from '../../../providers/wallet.service';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { timer, Subscription } from 'rxjs';
import { CSCUtil } from '../../../domains/csc-util';
import { CSCCrypto } from '../../../domains/csc-crypto';
import { AppConstants } from '../../../domains/app-constants';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WalletDefinition } from '../../../domains/csc-types';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-custom-pin',
  templateUrl: './custom-pin.component.html',
  styleUrls: ['./custom-pin.component.scss'],
})
export class CustomPinComponent implements OnInit {

  @Input()  transaction: string;
  @Input()  actionMessage: string;
  selectedWallet: WalletDefinition;
  walletPassword: string;
  walletCreationDate: string;
  walletEmail: string;
  wallets: any[] = [];

  returnUrl: string;
  footer_visible = false;
  error_message: string;
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
      private datePipe: DatePipe,
      private modal: ModalController,
      private translate: TranslateService,
      private decimalPipe: DecimalPipe,
      public sessionStorageService: SessionStorageService,
      public localStorageService: LocalStorageService

    ) {
      this.defaultAccount = this.localStorageService.get(AppConstants.KEY_DEFAULT_ACCOUNT_ID);
      this.statusBar.styleLightContent();
    }

  ngOnInit() {
    this.logger.debug('### %%%%%%%%%%%%%%%%%Custom PIN page  onInit');
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // get available wallets (we switched to a single wallet for WLT wallet)
    this.availableWallets = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    if (this.availableWallets === null) {
        this.selectedWallet = { walletUUID: '', creationDate: -1, location: '', mnemonicHash: '', network: '', passwordHash: '', userEmail: ''};
        this.router.navigate(['/wallet-setup']);
    }
    // set first wallet as selected
    this.selectedWallet = this.availableWallets[this.availableWallets.length - 1];
    const walletCreationDate = new Date(CSCUtil.casinocoinToUnixTimestamp(this.selectedWallet.creationDate));
    this.translate.get('PAGES.LOGIN.CREATED-ON').subscribe((res: string) => {
        this.walletCreationDate = res + ' ' + this.datePipe.transform(walletCreationDate, 'yyyy-MM-dd HH:mm:ss');
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
  async validatePincode() {
    if(this.enteredPinCode.length === 6){
      // this.pinCodeViewChild.setBlur();
      // this.loader = this.loader.create({spinner: 'crescent', content: 'Validating PIN', duration: 60000});
      this.loading
      .create({
        keyboardClose:true,
        message:"validando PIN"
      })
      .then( loading => {
         loading.present().then( async () => {
           // setTimeout(() => {
           this.logger.debug('### Login Page ::: OpenWallet: ' + JSON.stringify(this.selectedWallet));
           if (this.enteredPinCode == null || this.enteredPinCode.length === 0) {
               this.error_message = 'Unkown and very strange error!';


           } else {

               const finishTimer = timer(1000);
               finishTimer.subscribe( async val => {
                   this.logger.debug('### LoginComponent - Check Wallet Password ###');
                   if (this.walletService.checkWalletPasswordHash(this.enteredPinCode, this.selectedWallet.walletUUID, this.selectedWallet.passwordHash)) {
                       this.logger.debug('### checkWalletHash: OK');


                       this.modal.dismiss( {state:true, password: this.enteredPinCode, message:"hola" }, "txResult" );



                       this.error_message = '';

                   } else {
                       // Invalid Wallet Password !!!

                       this.error_message = 'You entered an invalid PIN. Please retry!';
                   }
                   if(this.error_message  == ""){
                     this.loading.dismiss();
                     this.modal.dismiss( true, "success" );
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
                       this.modal.dismiss();
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
    this.modal.dismiss();
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
