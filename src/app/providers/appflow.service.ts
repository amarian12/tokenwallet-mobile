import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { CustomPinComponent } from '../pages/login/custom-pin/custom-pin.component';
import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, take, filter, map } from 'rxjs/operators';
import { CSCAmountPipe } from '../domains/csc.pipes';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AppConstants } from '../domains/app-constants';
import { CasinocoinService } from './casinocoin.service';
import { CSCUtil } from '../domains/csc-util';
import { CSCURI } from '../domains/csc-types';
import { WalletService } from './wallet.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LedgerStreamMessages, TokenType, Payment, WalletDefinition, WalletSettings } from '../domains/csc-types';
import Big from 'big.js';

@Injectable({
  providedIn: 'root'
})
export class AppflowService {
  private _tokenlist = new BehaviorSubject<TokenType[]>([]);
  private _cscaccounts = new BehaviorSubject<any[]>([]);
  private _transctionParams = new BehaviorSubject<any>({});
  private _transctionList = new BehaviorSubject<any>({});
  private _walletBalances = new BehaviorSubject<any[]>([]);
  private _connectedStatus = new BehaviorSubject<boolean>(false);
  // private tokenlist:Array<TokenType>;

  walletSettings: WalletSettings = {
    showNotifications: false,
    fiatCurrency: 'USD',
    walletUser: "",
    walletLanguage: "en",
    styleTheme:"light"
  };
  columnCount: number;
  isLoading: boolean;
  ledgers: LedgerStreamMessages[] = [];
  receipient: string;
  description: string;
  amount: string;
  fees: string;
  accountReserve: string;
  reserveIncrement: string;
  walletPassword: string;
  showPasswordDialog: boolean;
  loggedIn = false;
  authCorrect = false;
  showLedgerDialog: boolean;
  showAddTokenDialog: boolean;
  showAddCSCDialog: boolean;
  signAndSubmitIcon: string;
  translateParams = {accountReserve: '10'};
  cscBalance: string;
  canActivateToken: boolean;
  currentToken: TokenType;
  // connectedStatus= false;

  userName: string;
  dark: boolean;
  language = "en";
  currency = "USD";
  mainCSCAccountID: string;
  availableTokenlist: Array<TokenType> = [];
  addToken: TokenType;
  addIcon = 'fa fa-plus';
  footer_visible = false;
  error_message: string;
  // cscAccounts: Array<any> = [];
  selectedCSCAccount: string;
  addTokenAccountSelected: boolean;
  showErrorDialog = false;

  public cscReceiveURI: string = null;
  showReceiveQRCodeDialog = false;
  sendAmount: string;
  destinationTag: number;
  label: string;
  copyIcon = 'fa fa-copy';

  showSecretDialog = false;
  showSecret = false;
  accountSecret: string;
  // numberOfTokenAccounts: Array<number> =[0];
  numberOfTokenAccounts: Array<number>;

  showEditAccountLabel = false;
  accountLabel = '';
  barcodeScannerOptions: BarcodeScannerOptions;

  constructor(
    private logger: LogService,
    private localStorageService: LocalStorageService,
    private barcodeScanner: BarcodeScanner,
    private sessionStorageService: SessionStorageService,
    private casinocoinService: CasinocoinService,
    private alertCtrl: AlertController,
    public modal: ModalController,
    private walletService: WalletService,
    private cscAmountPipe: CSCAmountPipe

  ) {
    // barcodeScanner options

    // this.barcodeScannerOptions = {
    //      preferFrontCamera : true, // iOS and Android
    //      showFlipCameraButton : true, // iOS and Android
    //      showTorchButton : true, // iOS and Android
    //      torchOn: false, // Android, launch with the torch switched on (if available)
    //      prompt : "Scan a QR with Account info", // Android
    //      resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //      formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
    //      orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
    //      disableAnimations : true, // iOS
    //      disableSuccessBeep: false // iOS and Android
    //  };
    // load wallet settings
    this.walletSettings = this.localStorageService.get(AppConstants.KEY_WALLET_SETTINGS);
    if (this.walletSettings == null){
      // settings do not exist yet so create
      this.walletSettings = {
        showNotifications: false,
        fiatCurrency: 'USD',
        walletUser: "",
        walletLanguage: "en",
        styleTheme:"light"
      };
      this.localStorageService.set(AppConstants.KEY_WALLET_SETTINGS, this.walletSettings);
    }
    this.userName = this.walletSettings.walletUser || "";
    this.dark = (this.walletSettings.styleTheme == "dark")?true:false;
    this.language = this.walletSettings.walletLanguage ;
    this.currency = this.walletSettings.fiatCurrency ;
    this.logger.debug('### Appflow: consturctor() ###');
    this.columnCount = 5;








    // refresh server list
    this.casinocoinService.updateServerList();
    // connect to CasinoCoin network
    this.casinocoinService.connectSubject.subscribe( result => {
      if (result === AppConstants.KEY_CONNECTED) {
        this.connectedStatus.pipe(take(1)).subscribe(connected => {
          this._connectedStatus.next(true);
          this.logger.debug('### Appflow: connectedStatus is true CONNECTED');

        });
        // translation parameters
        // this.translateParams = {accountReserve: this.casinocoinService.serverInfo.reserveBaseCSC};
        // refresh Accounts
        this.logger.debug('### Appflow: Account Refresh');
        this.casinocoinService.refreshAccounts().subscribe(accountRefreshFinished => {
          if (accountRefreshFinished) {
            // refresh Token List
            this.logger.debug('### Appflow: TokenList Refresh');
            this.casinocoinService.refreshAccountTokenList().subscribe(finished => {

              if (finished) {
                this.tokenlist.pipe(take(1)).subscribe(tokenlist => {
                  this._tokenlist.next(this.casinocoinService.tokenlist);
                  this.logger.debug('### Appflow: TokenList Refresh: new tokenlist: '+JSON.stringify(this.casinocoinService.tokenlist));
                  this._walletBalances.pipe(take(1)).subscribe(wallet =>{
                       this.updateBalance(this.casinocoinService.tokenlist);
                  });


                });


                // this.numberOfTokenAccounts = new Array(this.tokenlist.length).fill(0);
                // this.logger.debug('### Appflow TokenList: ' + JSON.stringify(this.tokenlist));
                // remove password from session if its still there
                this.sessionStorageService.remove(AppConstants.KEY_WALLET_PASSWORD);
              }
            });
            // Check if user password is still in the session
            const userPass = this.sessionStorageService.get(AppConstants.KEY_WALLET_PASSWORD);
            if (userPass != null) {
                this.sessionStorageService.remove(AppConstants.KEY_WALLET_PASSWORD);
            }
          }
        });
        // set fees
        this.transactionParams.pipe(take(1)).subscribe(transactionParams => {
          this._transctionParams.next({
            fees: this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC,
            accountReserve: this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC,
            reserveIncrement: this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC
          });

        });
      }else{
        this.connectedStatus.pipe(take(1)).subscribe(connected => {
          this._connectedStatus.next(false);
          this.logger.debug('### Appflow: connectedStatus is false DISCONNECTED');

        });
      }
    });
    this.walletService.openWalletSubject.subscribe( result => {
      if (result === AppConstants.KEY_LOADED) {
        // get the main CSC AccountID
        if( this.localStorageService.get(AppConstants.KEY_SETUP_COMPLETED)){
          this.mainCSCAccountID = this.walletService.getMainAccount().accountID;
          // this.logger.debug('### Appflow: cscmain account resulted in this '+ this.mainCSCAccount);
          // get all CSC accounts for add token dropdown
          this.walletService.getAllAccounts().forEach( element => {
            if (element.currency === 'CSC' && new Big(element.balance) > 0 && element.accountSequence >= 0) {
               const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                  this.cscAmountPipe.transform(element.balance, false, true) + ']';
              this.cscaccounts.pipe(take(1)).subscribe(cscaccounts => {
                this._cscaccounts.next(cscaccounts.concat({label: accountLabel, value: element.accountID}));

              });
              // this.cscAccounts.push({label: accountLabel, value: element.accountID});
            }
          });

        }

        // subscribe to account updates
        this.casinocoinService.accountSubject.subscribe( account => {
          this.transactionParams.pipe(take(1)).subscribe(transactionParams => {
            this._transctionParams.next({
              fees: this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC,
              accountReserve: this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC,
              reserveIncrement: this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC
            });

          });
          // this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
          // this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
          // this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
          // refresh all CSC accounts for add token dropdown
          this._cscaccounts.next([]);
          this.walletService.getAllAccounts().forEach( element => {
            if (element.currency === 'CSC' && new Big(element.balance) > 0  && element.accountSequence >= 0) {
               const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                  this.cscAmountPipe.transform(element.balance, false, true) + ']';
                this.cscaccounts.pipe(take(1)).subscribe(cscaccounts => {
                  this._cscaccounts.next(cscaccounts.concat({label: accountLabel, value: element.accountID}));

                });
            }
          });
          this.isLoading = false;
        });
      }
    });



   }
   get tokenlist(){
     return this._tokenlist.asObservable()
   }
   getTokenAccount( pkID: string){
     return this.tokenlist.pipe(take(1),map(tokenList => {
        return {...tokenList.find( token => token.PK === pkID)};
     }));
   }
   get cscaccounts(){
     return this._cscaccounts.asObservable()
   }
   getCSCAccount( pkID: string){
     return this.cscaccounts.pipe(take(1),map(cscAccounts => {
        return {...cscAccounts.find( account => account.PK === pkID)};
     }));
   }
   get connectedStatus(){
     return this._connectedStatus.asObservable()
   }
   getConectedStatus(){
     return this.connectedStatus.pipe(take(1),map(connectedStatus => {
        return connectedStatus;
     }));
   }
   get transactionParams(){
     return this._transctionParams.asObservable()
   }

   get walletBalances(){
     return this._walletBalances.asObservable()
   }
   getFees(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
        return transactionParams.fees;
     }));
   }
   getAccountReserve(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
       return transactionParams.accountReserve;
     }));
   }
   getReserveIncrement(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
       return transactionParams.reserveIncrement;
     }));

   }
   saveWalletSettings(settings:WalletSettings){
     this.localStorageService.set(AppConstants.KEY_WALLET_SETTINGS, settings);
   }
   getTokenConsolidatedBalance(token){
     return this.walletBalances.pipe(take(1),map(walletBalances => {
       this.logger.debug('### Appflow:  finding '+token+' balance'+JSON.stringify(walletBalances));

       return {...walletBalances.find( balance => balance.token === token)}.balance;

     }));

   }
   getAllTokenBalances(){
     return this.walletBalances.pipe(take(1),map(walletBalances => {
       this.logger.debug('### Appflow: finding all balances'+JSON.stringify(walletBalances));

       return walletBalances;

     }));

   }
   addTokenToAccount(token, accountID,password){
     this.logger.debug('### WalletPage: add Token to CSC account');
     // const password = '1234567';
     this.walletPassword = password;
     const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);

     if (this.walletService.checkWalletPasswordHash(this.walletPassword, walletObject.walletUUID, walletObject.passwordHash)){

       const instructions = { maxLedgerVersionOffset: 3, fee: this.fees };
       const trustobject = this.walletService.addTokenToAccount(token, password, accountID);


       this.logger.debug('### WalletPage: password OK adding Token to account');
       this.casinocoinService.cscAPI.prepareTrustline(accountID, trustobject.trustline, instructions).then( preparedTrust => {
         this.logger.debug('### Trustline Result: ' + JSON.stringify(preparedTrust));
         return this.casinocoinService.cscAPI.sign(preparedTrust.txJSON, trustobject.cryptKey);
       }).then( trustSignResult => {
         this.logger.debug('### Trustline Sign Result: ' + JSON.stringify(trustSignResult));
         return this.casinocoinService.cscAPI.submit(trustSignResult.signedTransaction);
       }).then( trustSubmitResult => {
         this.logger.debug('### Trustline Submit Result: ' + JSON.stringify(trustSubmitResult));
         this.casinocoinService.refreshAccountTokenList().subscribe( refreshResult => {
           if (refreshResult) {
             this.tokenlist.pipe(take(1)).subscribe(tokenlist => {
               this._tokenlist.next(this.casinocoinService.tokenlist);


             });

           }
         });


       });

       }else{
         this.logger.debug('### WalletPage: addtoken password WRONG not adding account');
       }
   }
   async onValidateTx(transaction,actionMessage){
     // console.log("cscAccounts: ",this.cscAccounts);
     // console.log("tokens: ",this.availableTokenlist);
     return this.modal
     .create({
       component: CustomPinComponent,
       componentProps: {
         transaction:transaction,
         actionMessage:actionMessage
     }}).then(
       async customPinModal => {
         customPinModal.present();
         return await customPinModal.onDidDismiss();
       }).then(
         async resultData => {
           if(resultData.role === "txResult"){
             this.logger.debug("#### wallet: txREsult: " + JSON.stringify(resultData.data))
             return await resultData;
             // this.addTokenToAccount(resultData.data.token,resultData.data.account)
           }
         });
   }
   async scanQRCode(){
     // Scan CasinoCoin QRCode
     const result = await this.barcodeScanner.scan().then((barcodeData) => {
       this.logger.debug('### SEND - QR Scanned: ' + JSON.stringify(barcodeData));
       const cscUri: CSCURI = CSCUtil.decodeCSCQRCodeURI(barcodeData.text);
       return cscUri;
     }, (err) => {
       // An error occurred
       this.logger.error('### SEND QR Error: ' + JSON.stringify(err));
       return err;
     });
     return result;
   }
   updateBalance(tokenlist){
      this.walletBalances.pipe(take(1)).subscribe(walletBalances => {
        var tokenArray = walletBalances ? walletBalances : [];
        this.logger.debug('### Appflow: We will update general balances :'+ JSON.stringify(walletBalances));
        tokenlist.forEach( token => {
          var balance = this.walletService.getWalletBalance(token.Token) ? this.walletService.getWalletBalance(token.Token) : "0";
          if(parseInt(balance) > 0 || token.Token === 'CSC'){
              if(tokenArray.findIndex( object => object.token === token.Token ) < 0 ){
                var i = tokenArray.findIndex( object => object.token === token.Token );
                this.logger.debug('### Appflow: adding balance for token:'+token.Token);
                tokenArray.push({token:token.Token,balance:balance,img:token.IconURL});

              }else{
                var i = tokenArray.findIndex( object => object.token === token.Token );
                tokenArray[i].balance = balance;
                this.logger.debug('### Appflow:  updated on array cause we found balance:'+token.Token+" is: "+balance );

              }
          }

          this._walletBalances.next(tokenArray);
          this.logger.debug('### Appflow:  updated with a new balance array:'+JSON.stringify(tokenArray)+" is: "+balance );

        });


      });

   }

}
