import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { LogService } from '../../providers/log.service';
import { NotificationService, SeverityType } from '../../providers/notification.service';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { AppflowService } from '../../providers/appflow.service';
import { WalletService } from '../../providers/wallet.service';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto }  from '../../domains/csc-crypto';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { AppConstants } from '../../domains/app-constants';
import { LokiKey, LokiTransaction, LokiTxStatus, LokiAccount } from '../../domains/lokijs';
import { LedgerStreamMessages, TokenType, Payment, WalletDefinition } from '../../domains/csc-types';
import Big from 'big.js';

@Component({
  selector: 'app-import-account',
  templateUrl: './import-account.page.html',
  styleUrls: ['./import-account.page.scss'],
})
export class ImportAccountPage implements OnInit {
  accountToImport = {
    label: "Imported Account",
    secret:"",
  }
  importTypeSelected = "funds";
  importingTypeLegend = "";
  externalAccountsCounter = 0;
  importRequiredTotalReserve = 0;
  loader:any;
  newTxCounter = 0;
  errorMessageList: string[];
  theme:string;

  constructor(
    private logger: LogService,
    private casinocoinService: CasinocoinService,
    private loading: LoadingController,
    private appflow: AppflowService,
    private notificationService: NotificationService,
    private walletService: WalletService,
    private alert: AlertController,
    private translate: TranslateService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {

  }
  async scanQRCode(){
    let data = await this.appflow.scanQRCode();
    this.logger.debug("#### Import Account Page ::: DATA ON QR::: "+JSON.stringify(data));
      if(data.address === "secret"){
        this.accountToImport.secret = data.secret;
        this.logger.debug("#### Import Account Page ::: Secret loaded to form ");

      }else{
        this.logger.debug("#### Import Account Page ::: This is not a valid paper wallet QR ");
        const errorWrongQR = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['VSUBHEADER'],
          message:this.errorMessageList['QRINVALID'],
          okbtn:this.errorMessageList['OKBTN']
        }
        this.displayError(errorWrongQR);


      }



  }
  beginImportProcess(){
    this.logger.debug('### Import Account Page ::: Validating form before processing Import');
    if(!this.casinocoinService.cscAPI){
      const errorDisconnected = {
        header:this.errorMessageList['HEADER'],
        subheader:this.errorMessageList['SUBHEADER'],
        message:this.errorMessageList['DISCONNECTED'],
        okbtn:this.errorMessageList['OKBTN']
      }
      this.displayError(errorDisconnected);

      return false;
    }else if(this.accountToImport.secret.trim() == "" ){
        this.logger.debug('### Import Account Page ::: you need to enter a secret :'+JSON.stringify(this.accountToImport));
        const errorNeedSecret = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['VSUBHEADER'],
          message:this.errorMessageList['NEEDSECRET'],
          okbtn:this.errorMessageList['OKBTN']
        }
        this.displayError(errorNeedSecret);
        return false;

      }else if (!this.casinocoinService.cscAPI.isValidSecret(this.accountToImport.secret.trim())) {
        this.logger.debug('### Import Account Page ::: wrong account secret :'+JSON.stringify(this.accountToImport));
        const errorWrongSecret = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['VSUBHEADER'],
          message:this.errorMessageList['WRONGSECRET'],
          okbtn:this.errorMessageList['OKBTN']
        }
        this.displayError(errorWrongSecret);
          return false;
      } else {
        if(this.accountToImport.label.trim() == "" ){
          this.logger.debug('### Import Account Page ::: you need to enter any label :'+JSON.stringify(this.accountToImport));
          const errorNeedLabel = {
            header:this.errorMessageList['HEADER'],
            subheader:this.errorMessageList['VSUBHEADER'],
            message:this.errorMessageList['NEEDLABEL'],
            okbtn:this.errorMessageList['OKBTN']
          }
          this.displayError(errorNeedLabel);
          return false;

        }else{
          // determine account from secret
          const importKeyPair = this.casinocoinService.cscAPI.deriveKeypair(this.accountToImport.secret.trim());
          const accountID = this.casinocoinService.cscAPI.deriveAddress(importKeyPair.publicKey);
          const findAccount = this.walletService.getAccount('CSC', accountID);
          if (findAccount) {
            this.logger.debug('### Import Account Page ::: The account you want to import is already in this wallet');
            const errorAlreadyAdded = {
              header:this.errorMessageList['HEADER'],
              subheader:this.errorMessageList['VSUBHEADER'],
              message:this.errorMessageList['ALREADYADDED'],
              okbtn:this.errorMessageList['OKBTN']
            }
            this.displayError(errorAlreadyAdded);
            return false;

          }else{

            this.logger.debug('### Import Account Page ::: Are you sure you want to continue??? :'+JSON.stringify(this.accountToImport));
            this.alert.create({
              header: this.errorMessageList['WHEADER'],
              subHeader: this.errorMessageList['WSUBHEADER'],
              message: this.errorMessageList['WARNING'],
              buttons: [
                {
                  text: this.errorMessageList['CANCELBTN'],
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                    this.logger.debug('### Import Account Page ::: Aborting Import!!');
                  }
                }, {
                  text: this.errorMessageList['PROCEEDBTN'],
                  handler: () => {
                    this.logger.debug('### Import Account Page ::: Will import account from secret!!');
                    if(this.importTypeSelected == 'funds'){
                      this.importByMovingBalance();

                    }else{
                      this.importAccountAsExternal();

                    }
                  }
                }
              ]
            }).then( alert =>  {
              alert.present();
            });

          }

        }
      }
  }
  typeChanged(){

    if(this.importTypeSelected == "funds"){
      this.importingTypeLegend = this.errorMessageList["KEY-EXISTING"];
    }else{
      this.importingTypeLegend = this.errorMessageList["KEY-ADD"];
    }
  }
  onCancel(){
    // this.resetContact();
    // this.router.navigate(['./tabs/dashboard/settings'], { relativeTo: this.activeRoute.parent });
    this.clearForm();
    this.router.navigate(['./tabs/dashboard/settings']);
  }
  ngOnInit() {
    this.translate.get('PAGES.IMPORT.LEGENDS').subscribe((res: string[]) => {
        this.errorMessageList = res;
        this.logger.debug('### Import Account Page :::  Errors list: ' + JSON.stringify(this.errorMessageList));
        this.importingTypeLegend = this.errorMessageList["KEY-EXISTING"];
    });
  }
  ionViewWillEnter(){
    this.theme = this.appflow.dark ? "dark":"light";
  }

  async importByMovingBalance(){

      this.logger.debug('### Import Account Page ::: Moving funds option selected');
      // check password
      // start loader
      this.loader = await this.loading
      .create({
        keyboardClose:true,
        message:"processing account import: moving funds"
      });
      const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
      const result = await this.appflow.onValidateTx("ImportAccount","Enter PIN to authorize external account Importing",this.theme);
        if(result.data && result.data.state){
          this.loader.present();
          const password = result.data.password;
          this.logger.debug('### Import Account Page ::: resultdata :'+JSON.stringify(result));


            // determine account from secret
            const importKeyPair = this.casinocoinService.cscAPI.deriveKeypair(this.accountToImport.secret.trim());
            const accountID = this.casinocoinService.cscAPI.deriveAddress(importKeyPair.publicKey);
            const findAccount = this.walletService.getAccount('CSC', accountID);
            if (findAccount) {
              this.logger.debug('### Import Account Page ::: The account you want to import is already in this wallet');

            }
            this.logger.debug('### Import Account Page ::: accountID :'+accountID);

            const userEmail = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET).userEmail;
            const secretsCSCCrypto = new CSCCrypto(password, userEmail);

            // get fees, account reserve to calculate transaction cost
            const fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
            const accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
            const ownerReserve = Number(this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC);

            // get a new account to import

            const mainAccount: LokiAccount = this.walletService.addCSCAccount(password,this.accountToImport.label.trim());
            const mainAccountKey: LokiKey = this.walletService.getKey(mainAccount.accountID);
            const mainAccountDecryptedSecret = secretsCSCCrypto.decrypt(mainAccountKey.secret);
            //preparing counters
            let ledgerBalances: any;
            let balanceCountHandled = 0;
            const tokenReadyForTransferSubject = new Subject<any>();

            // get account balances to import
          const balanceSubject = await this.casinocoinService.cscAPI.getBalances(accountID).then(balances => {
              this.logger.debug('### Import Account Page :::  balances: ' + JSON.stringify(balances));
              ledgerBalances = balances;
              this.logger.debug('### Import Account Page :::  ledgerBalances: ' + JSON.stringify(ledgerBalances));
              this.logger.debug('### Import Account Page :::  ledgerBalances length: ' + JSON.stringify(ledgerBalances.length));
              // calculate  transactions cost
              const requiredOwnerReserve = ownerReserve * balances.length;
              const requiredFees =  Number(fees) * balances.length * 2;
              // calculate  full transactions cost
              this.importRequiredTotalReserve = new Big(CSCUtil.cscToDrops(accountReserve)).plus(new Big(CSCUtil.cscToDrops(requiredFees.toString()))).plus(new Big(CSCUtil.cscToDrops(requiredOwnerReserve.toString())));
              const cscBalance = balances.find( item => item.currency === 'CSC');
              // verify if fund allow transaction
              const importCSCValue = new Big(CSCUtil.cscToDrops(cscBalance.value)).minus(this.importRequiredTotalReserve);
              this.logger.debug('### Import Account Page ::: requiredTotalReserve: ' + this.importRequiredTotalReserve);
              this.logger.debug('### Import Account Page ::: do we have enough for transaction? ' + importCSCValue);

              // check if we have enough to move. If we do then prepare the transactions.
              if ( importCSCValue > 0) {
                // check if we only have CSC to move or if we have token balance to move
                if (balances.length === 1 && cscBalance !== undefined) {
                  const cscPayment: any = {
                    source: { address: accountID, maxAmount: { value: CSCUtil.dropsToCsc(importCSCValue.toString()), currency: cscBalance.currency } },
                    destination: { address: mainAccount.accountID, amount: { value: CSCUtil.dropsToCsc(importCSCValue.toString()), currency: cscBalance.currency } }
                  };
                  this.logger.debug('### Import Account Page ::: import csc payment: ' + JSON.stringify(cscPayment));
                  this.casinocoinService.cscAPI.preparePayment(accountID, cscPayment).then( preparedPayment => {
                    this.logger.debug('### Import Account Page ::: CSC Prepared Payment Result: ' + JSON.stringify(preparedPayment));
                    return this.casinocoinService.cscAPI.sign(preparedPayment.txJSON, this.accountToImport.secret.trim());
                  }).then( paymentSignResult => {
                    this.logger.debug('### Import Account Page ::: Payment Sign Result: ' + JSON.stringify(paymentSignResult));
                    return this.casinocoinService.cscAPI.submit(paymentSignResult.signedTransaction);
                  }).then( cscPaymentSubmitResult => {
                    this.logger.debug('### Import Account Page ::: Payment Submit Result: ' + JSON.stringify(cscPaymentSubmitResult));
                    // save the wallet
                    this.walletService.saveWallet();
                    // subcribe to all accounts again
                    this.casinocoinService.subscribeAccountEvents();
                    // refresh lists
                    this.casinocoinService.refreshAccountTokenList();
                    // we are done so we present a notification about it
                    this.logger.debug('### Import Account Page :: Importing CSC Account - Send Notification!');

                    let addedAccountsMessage =  'Funds from external account';

                    this.notificationService.addMessage({
                        severity: SeverityType.info,
                        title: addedAccountsMessage+" Imported!",
                        body: ' Finished moving '+CSCUtil.dropsToCsc(importCSCValue.toString())+' CSC '+addedAccountsMessage+'to new acount: '+this.accountToImport.label+'. Funds are now on your wallet.'
                      },()=>{
                        this.logger.debug('### Import Account Page :: Moving funds from external account - ALL DONE!');
                        this.clearForm();
                        this.loader.dismiss();
                      }
                      );

                  });
                } else {
                  // we  need to move out first the CSC
                  ledgerBalances.forEach( balance => {
                    if (balance.currency === 'CSC') {
                      const sendCSCAmount = new Big(CSCUtil.cscToDrops(balance.value)).minus(this.importRequiredTotalReserve);
                      const cscPayment: any = {
                        source: {
                          address: accountID,
                          maxAmount: { value: CSCUtil.dropsToCsc(sendCSCAmount.toString()), currency: balance.currency }
                        },
                        destination: {
                          address: mainAccount.accountID,
                          amount: { value: CSCUtil.dropsToCsc(sendCSCAmount.toString()), currency: balance.currency }
                        },
                        allowPartialPayment: false
                      };
                      this.logger.debug('### Import Account Page ::: import csc payment: ' + JSON.stringify(cscPayment));
                      this.casinocoinService.cscAPI.preparePayment(accountID, cscPayment).then( preparedPayment => {
                        this.logger.debug('### Import Account Page ::: CSC Prepared Payment Result: ' + JSON.stringify(preparedPayment));
                        return this.casinocoinService.cscAPI.sign(preparedPayment.txJSON, this.accountToImport.secret.trim());
                      }).then( paymentSignResult => {
                        this.logger.debug('### Import Account Page ::: CSC Payment Sign Result: ' + JSON.stringify(paymentSignResult));
                        return this.casinocoinService.cscAPI.submit(paymentSignResult.signedTransaction);
                      }).then( cscPaymentSubmitResult => {
                        this.logger.debug('### Import Account Page :::CSC  Payment Submit Result: ' + JSON.stringify(cscPaymentSubmitResult));
                        balanceCountHandled++;
                        // now we can move the other tokens
                        this.processTokenTrustlinesImport(balances, mainAccount, tokenReadyForTransferSubject, mainAccountDecryptedSecret, fees);

                      }).catch( error => {
                        this.logger.debug('### Import Account Page :: Importing Account - Something went wrong prepping the CSC payment!');
                        const errorTransfer = {
                          header:this.errorMessageList['HEADER'],
                          subheader:this.errorMessageList['SUBHEADER'],
                          message:this.errorMessageList['TRANSFERERROR'],
                          okbtn:this.errorMessageList['OKBTN']
                        }
                        this.displayError(errorTransfer);
                        console.log(error);
                        this.loader.dismiss();
                      });
                    }
                  });

                }
              } else {
                  this.logger.debug('### Import Account Page ::: Not enough CSC in the source account to handle all required transactions, you need more. requiredTotalReserve: ' + this.importRequiredTotalReserve);
                  const errorNeedSecret = {
                    header:this.errorMessageList['HEADER'],
                    subheader:this.errorMessageList['SUBHEADER'],
                    message:this.errorMessageList['NOTENOUGH'],
                    okbtn:this.errorMessageList['OKBTN']
                  }
                  this.displayError(errorNeedSecret);
                  this.loader.dismiss();

              }
            });
              // set transaction processing and make it listen to any transaction requested from the previows processed
              tokenReadyForTransferSubject.subscribe( async tokenBalance => {
                // create payment and send all tokens to main account
                const tokenPayment: any = {
                  source: {
                    address: accountID,
                    maxAmount: {
                      value: tokenBalance.value,
                      currency: tokenBalance.currency,
                      counterparty: tokenBalance.counterparty
                    }
                  },
                  destination: {
                    address: mainAccount.accountID,
                    amount: {
                      value: tokenBalance.value,
                      currency: tokenBalance.currency,
                      counterparty: tokenBalance.counterparty
                    }
                  }
                };
                this.logger.debug('### Import Account Page :::import token payment: ' + JSON.stringify(tokenPayment));
                this.casinocoinService.cscAPI.preparePayment(accountID, tokenPayment).then( preparedPayment => {
                  this.logger.debug('### Import Account Page ::: Prepare token Payment Result: ' + JSON.stringify(preparedPayment));
                  return this.casinocoinService.cscAPI.sign(preparedPayment.txJSON, this.accountToImport.secret.trim());
                }).then( paymentSignResult => {
                  this.logger.debug('### Import Account Page ::: token Payment Sign Result: ' + JSON.stringify(paymentSignResult));
                  return this.casinocoinService.cscAPI.submit(paymentSignResult.signedTransaction);
                }).then( paymentSubmitResult => {
                  this.logger.debug('### Import Account Page ::: Token Payment Submit Result: ' + JSON.stringify(paymentSubmitResult));
                  // check if we did the last token balance
                  balanceCountHandled++;
                  this.logger.debug('### Import Account Page ::: Processing token tx ::: balances: ' + ledgerBalances.length + ' Handled: ' + balanceCountHandled);
                  this.logger.debug('### Import Account Page ::: Processing token tx ::: full balances: ' + JSON.stringify(ledgerBalances));
                  // Tis the last one so wrap it up
                  if (ledgerBalances.length === (balanceCountHandled - 1) ) {
                    // save the wallet
                    this.walletService.saveWallet();
                    // subcribe to all accounts again
                    this.casinocoinService.subscribeAccountEvents();
                    // refresh lists
                    this.casinocoinService.refreshAccountTokenList();
                    // we are done so we present a notification about it
                    this.logger.debug('### Import Account Page :: Importing Account - Send Notification!');

                    let addedAccountsMessage =  'Funds from '+balanceCountHandled+' external accounts';

                    this.notificationService.addMessage({
                        severity: SeverityType.info,
                        title: addedAccountsMessage+" Imported!",
                        body: ' Finished moving '+addedAccountsMessage+'to new acounts: '+this.accountToImport.label+'. Funds are now on your wallet.'
                      },()=>{
                        this.logger.debug('### Import Account Page :: Moving funds from '+balanceCountHandled+' external accounts - ALL DONE!');
                        this.clearForm();
                        this.loader.dismiss();
                      }
                      );

                  }
                }).catch( error => {
                  this.logger.debug('### Import Account Page :: Importing Account -Something went wrong prepping the TOKEN payment!');
                  console.log(error);const errorTransfer = {
                    header:this.errorMessageList['HEADER'],
                    subheader:this.errorMessageList['SUBHEADER'],
                    message:this.errorMessageList['TRANSFERERROR'],
                    okbtn:this.errorMessageList['OKBTN']
                  }
                  this.displayError(errorTransfer);
                  this.loader.dismiss();

                });
              });

        }else{
          this.logger.debug('### Import Account Page ::: wrong password :'+JSON.stringify(result));

        }



        // check the destination account id

  }
  processTokenTrustlinesImport(balances:any, mainAccount:LokiAccount, balanceSubject:Subject<any>, secret:string, fees:string){
    if(!balances){
      return false;
    }
    let balance = balances.pop();
    if (balance.currency == 'CSC') {
      // if we reach CSC let's skip it
      balance = balances.pop();
    }else{

        // create new account
        const tokenInfo = this.casinocoinService.getTokenInfo(balance.currency);
        const tokenAccount = {
            pk: (tokenInfo.Token + mainAccount.accountID),
            accountID: mainAccount.accountID,
            balance: mainAccount.balance,
            accountSequence: mainAccount.accountSequence,
            currency: tokenInfo.Token,
            tokenBalance: '0',
            lastSequence: mainAccount.lastSequence,
            label: this.accountToImport.label.trim()+' '+tokenInfo.Token,
            activated: true,
            ownerCount: mainAccount.ownerCount,
            lastTxID: mainAccount.lastTxID,
            lastTxLedger: mainAccount.lastTxLedger
        };
        this.walletService.addAccount(tokenAccount);
        // save account to wallet
        // const trustobject = this.walletService.addTokenToAccount(tokenInfo.Token, password, mainAccount.accountID);
        this.logger.debug('### Import Account Page ::: creating token act: ' + JSON.stringify(tokenAccount));
        this.logger.debug('### Import Account Page ::: creating token from act: ' + JSON.stringify(mainAccount));
        // no token account yet so create trustline for it on the main account and add new token account
        const trustline = {
          currency: tokenInfo.Token,
          counterparty: tokenInfo.Issuer,
          limit: tokenInfo.TotalSupply
        };
        const instructions = { maxLedgerVersionOffset: 3, fee: fees };
        this.casinocoinService.cscAPI.prepareTrustline(mainAccount.accountID, trustline, instructions).then( preparedTrust => {
          this.logger.debug('### Import Account Page ::: creating token act  Trustline Result: ' + JSON.stringify(preparedTrust));
          return this.casinocoinService.cscAPI.sign(preparedTrust.txJSON, secret);
        }).then( trustSignResult => {
          this.logger.debug('### Import Account Page ::: creating token act  Trustline Sign Result: ' + JSON.stringify(trustSignResult));
          return this.casinocoinService.cscAPI.submit(trustSignResult.signedTransaction);
        }).then( async trustSubmitResult => {
          this.logger.debug('### Import Account Page :::  creating token act  Trustline Submit Result: ' + JSON.stringify(await trustSubmitResult));
          // mark balance ready for move the funds
          this.logger.debug('### Import Account Page :: What is being passed to the observable: balances'+ JSON.stringify(balance));
          this.logger.debug('### Import Account Page :: What is read on this var -> ledgerbalances'+ JSON.stringify(balances));
          this.processTokenTrustlinesImport(balances, mainAccount, balanceSubject, secret, fees);
          balanceSubject.next(balance);

        }).catch(error => {
          this.logger.debug('### Import Account Page :: Importing Account - Something went wrong creating trustlines for token account!');
          return false;
          console.log(error);
        });

    }

  }
  async importAccountAsExternal(){
      this.logger.debug('### Import Account Page ::: Import as external account option selected');
      // check password
      // start loader
      this.loader = await this.loading
      .create({
        keyboardClose:true,
        message:"processing account import: Inserting as external account"
      });
      const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
      const result = await this.appflow.onValidateTx("ImportAccount","authorize external account Importing",this.theme);
        if(result.data && result.data.state){
          this.loader.present();
          const password = result.data.password;
          this.logger.debug('### Import Account Page ::: resultdata :'+JSON.stringify(result));


            // determine account from secret
            const importKeyPair = this.casinocoinService.cscAPI.deriveKeypair(this.accountToImport.secret.trim());
            const accountID = this.casinocoinService.cscAPI.deriveAddress(importKeyPair.publicKey);
            const findAccount = this.walletService.getAccount('CSC', accountID);
            if (findAccount) {
              this.logger.debug('### Import Account Page ::: The account you want to import is already in this wallet');

            }
            this.logger.debug('### Import Account Page ::: accountID :'+accountID);

            const userEmail = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET).userEmail;
            const secretsCSCCrypto = new CSCCrypto(password, userEmail);

            // get account balances to import
          const balanceSubject = await this.casinocoinService.cscAPI.getBalances(accountID).then(balances => {
              this.logger.debug('### Import Account Page :::  balances: ' + JSON.stringify(balances));

              // derive keypair
              const keypair: any	=	this.casinocoinService.cscAPI.deriveKeypair(this.accountToImport.secret.trim());
              const newKeyPair: LokiKey	=	{ secret: this.accountToImport.secret.trim(), publicKey: keypair.publicKey, privateKey: keypair.privateKey, accountID: this.casinocoinService.cscAPI.deriveAddress(keypair.publicKey), encrypted: false};
              // save key to wallet
              this.walletService.addKey(newKeyPair);
              console.log('newKeyPair', newKeyPair);

              // encrypt wallet keys
              this.walletService.encryptAllKeys(password, userEmail).subscribe( async result => {
                if (result === AppConstants.KEY_FINISHED) {

                    balances.forEach(balance => {
                      console.log('balance', balance.currency);
                       this.casinocoinService.cscAPI.getAccountInfo(accountID).then((accountInfo) => {
                          if (accountInfo) {
                            if (balance.currency === 'CSC') {
                              const tokenAccount: LokiAccount = {
                                pk: ('CSC' + accountID),
                                accountID: accountID,
                                balance: balance.value,
                                accountSequence: -1,
                                currency: 'CSC',
                                tokenBalance: '0',
                                lastSequence: accountInfo.sequence,
                                label: this.accountToImport.label,
                                activated: true,
                                ownerCount: accountInfo.ownerCount,
                                lastTxID: accountInfo.previousAffectingTransactionID,
                                lastTxLedger: accountInfo.previousAffectingTransactionLedgerVersion
                              };
                              console.log('tokenAccount', tokenAccount);
                              // save account to wallet
                              this.walletService.addAccount(tokenAccount);
                              // subcribe to all accounts again
                              this.casinocoinService.subscribeAccountEvents();
                              // Refresh TokenList in the wallet
                              this.casinocoinService.updateAccountInfo(tokenAccount.currency, tokenAccount.accountID);
                              this.externalAccountsCounter++;

                            } else {
                              const tokenInfo = this.casinocoinService.getTokenInfo(balance.currency);
                              const tokenAccount: LokiAccount = {
                                pk: (tokenInfo.Token + accountID),
                                accountID: accountID,
                                balance: balance.value,
                                accountSequence: -1,
                                currency: tokenInfo.Token,
                                tokenBalance: '0',
                                lastSequence: accountInfo.sequence,
                                label: this.accountToImport.label +" "+tokenInfo.Token,
                                activated: true,
                                ownerCount: accountInfo.ownerCount,
                                lastTxID: accountInfo.previousAffectingTransactionID,
                                lastTxLedger: accountInfo.previousAffectingTransactionLedgerVersion
                              };
                              console.log('tokenAccount', tokenAccount);
                              // save account to wallet
                              this.logger.debug('### Import Account Page :: Import active account: Adding account to wallet');
                              this.walletService.addAccount(tokenAccount);
                              // Refresh TokenList in the wallet
                              this.logger.debug('### Import Account Page :: Import active account: Refreshing Token List');
                              this.casinocoinService.updateAccountInfo(tokenAccount.currency, tokenAccount.accountID);
                              // subcribe to all accounts again
                              this.logger.debug('### Import Account Page :: Import active account: Subscribe to account events');
                              this.casinocoinService.subscribeAccountEvents();
                              this.logger.debug('### Import Account Page :: Added external account');
                              this.externalAccountsCounter++;
                              this.logger.debug('### Import Account Page :: ext act counter: '+this.externalAccountsCounter);
                            }
                          }
                        }).catch(e => { console.log(e) });


                    });
                    // this.walletService.importsAccountSubject.next();
                    // get and add all account transactions
                const transSubject = await  this.casinocoinService.cscAPI.getTransactions(accountID, { earliestFirst: true }).then( txResult => {
                      console.log('txResult', txResult);
                      txResult.forEach( tx => {
                        if (tx.type === 'payment' && tx.outcome.result === 'tesSUCCESS') {
                          let txDirection: string;
                          let txAccountID: string;
                          if (this.walletService.isAccountMine(tx.specification['destination'].address)) {
                            txDirection = AppConstants.KEY_WALLET_TX_IN;
                            txAccountID = tx.specification['destination'].address;
                            if (this.walletService.isAccountMine(tx.specification['source'].address)) {
                              txDirection = AppConstants.KEY_WALLET_TX_BOTH;
                              txAccountID = tx.specification['source'].address;
                            }
                          } else if (this.walletService.isAccountMine(tx.specification['source'].address)) {
                            txDirection = AppConstants.KEY_WALLET_TX_OUT;
                            txAccountID = tx.specification['source'].address;
                          }
                          // create new transaction object
                          const dbTX: LokiTransaction = {
                            accountID: tx.address,
                            amount: CSCUtil.cscToDrops(tx.outcome['deliveredAmount'].value),
                            currency: tx.outcome['deliveredAmount'].currency,
                            destination: tx.specification['destination'].address,
                            fee: CSCUtil.cscToDrops(tx.outcome.fee),
                            flags: 0,
                            lastLedgerSequence: tx.outcome.ledgerVersion,
                            sequence: tx.sequence,
                            signingPubKey: '',
                            timestamp: CSCUtil.iso8601ToCasinocoinTime(tx.outcome.timestamp),
                            transactionType: tx.type,
                            txID: tx.id,
                            txnSignature: '',
                            direction: txDirection,
                            validated: (tx.outcome.indexInLedger >= 0),
                            status: LokiTxStatus.validated,
                            inLedger: tx.outcome.ledgerVersion
                          };
                          // add Memos if defined
                          if (tx.specification['memos']) {
                            dbTX.memos = [];
                            tx.specification['memos'].forEach(memo => {
                              const newMemo = {
                                memo:
                                this.removeUndefined({
                                  memoType: memo.type,
                                  memoFormat: memo.format,
                                  memoData: memo.data
                                })
                              };
                              dbTX.memos.push(newMemo);
                            });
                          }
                          // add Destination Tag if defined
                          if (tx.specification['destination'].tag) {
                            dbTX.destinationTag = tx.specification['destination'].tag;
                          }
                          // add Invoice ID if defined
                          if (tx.specification['invoiceID'] && tx.specification['invoiceID'].length > 0) {
                            dbTX.invoiceID = tx.specification['invoiceID'];
                          }
                          // insert into the wallet
                          this.walletService.addTransaction(dbTX);
                          this.logger.debug('### Import Account Page :: Added transaction');
                          this.newTxCounter++;
                          this.logger.debug('### Import Account Page :: tx counter: '+this.newTxCounter);
                        }
                      });
                    }).catch( e => {
                      console.log(e);
                      this.logger.debug('### Import Account Page :: Error getting transactions');

                    });

                    console.log(balanceSubject);
                    console.log(transSubject);

                    this.logger.debug('### Import Account Page :: Importing account process completed');

                    //finished
                  this.logger.debug('### Import Account Page :: Importing Account - Key Encryption Complete');
                  // refresh tokenlist
                  this.casinocoinService.refreshAccountTokenList();
                  // save the wallet
                  this.logger.debug('### Import Account Page :: Importing Account - Save wallet');
                  this.walletService.saveWallet();

                  let addedAccountsMessage = 'External Account';
                  // we are done so we present a notification about it
                  this.logger.debug('### Import Account Page :: Importing Account - Send Notification!');
                  if(this.externalAccountsCounter > 1){
                  addedAccountsMessage =  'External Accounts';
                  }
                  this.notificationService.addMessage({
                      severity: SeverityType.info,
                      title: addedAccountsMessage+" Added!",
                      body: this.accountToImport.label+' finished importing '+this.externalAccountsCounter+' '+addedAccountsMessage+' and '+this.newTxCounter+' transactions added to the wallet.'
                    },()=>{
                      this.logger.debug('### Import Account Page :: Importing Account - ALL DONE!');
                      this.clearForm();
                      this.loader.dismiss();
                    }
                    );

                }
              });
            }).catch(error => {

              this.logger.debug('### Import Account Page ::: found error on balances request :');
              console.log(error);
              this.logger.debug('### Import Account Page ::: no balances found, adding account :'+accountID);
              const tokenAccount: LokiAccount = {
                pk: ('CSC' + accountID),
                accountID: accountID,
                balance: '0',
                accountSequence: -1,
                currency: 'CSC',
                tokenBalance: '0',
                lastSequence: 0,
                label: this.accountToImport.label,
                activated: false,
                ownerCount: 0,
                lastTxID: "",
                lastTxLedger: 0
              };
              console.log('tokenAccount', tokenAccount);
              // save account to wallet
              this.logger.debug('### Import Account Page :: Importing Inactive Account - Add account to wallet!');
              this.walletService.addAccount(tokenAccount);
              // Refresh TokenList in the wallet
              this.logger.debug('### Import Account Page :: Importing Inactive Account - Refresh Token List!');
              this.casinocoinService.updateAccountInfo(tokenAccount.currency, tokenAccount.accountID);
              // subcribe to all accounts again
              this.logger.debug('### Import Account Page :: Importing Inactive Account - Subscribe to account event!');
              this.casinocoinService.subscribeAccountEvents();
              // refresh tokenlist
              this.casinocoinService.refreshAccountTokenList();
              // we are done so we save the wallet
              this.logger.debug('### Import Account Page :: Importing Inactive Account - Save wallet!');
              this.walletService.saveWallet();
              // we are done so we present a notification about it
              this.logger.debug('### Import Account Page :: Importing Inactive Account - Send Notification!');
              this.notificationService.addMessage({
                  severity: SeverityType.info,
                  title: 'External Account Added!',
                  body: 'Inactive Account '+this.accountToImport.label+' was added to the wallet.'
                 });
                 this.loader.dismiss();
                 this.clearForm();
            });

        }else{
          this.logger.debug('### Import Account Page ::: wrong password :'+JSON.stringify(result));

        }



        // check the destination account id

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
  clearForm(){
    this.accountToImport = {
      label: "Imported Account",
      secret:"",
    }
    this.importTypeSelected = "funds";
    this.importingTypeLegend = "";
    this.externalAccountsCounter = 0;
    this.newTxCounter = 0;
    this.typeChanged();
  }
  removeUndefined(obj: Object): Object {
    // return _.omit(obj, _.isUndefined)
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
  }


}
