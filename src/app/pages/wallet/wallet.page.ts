import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AddTokenComponent } from './add-token/add-token.component';

import { CasinocoinService } from '../../providers/casinocoin.service';
import { LogService } from '../../providers/log.service';
// import { MarketService } from '../../providers/market.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto }  from '../../domains/csc-crypto';
// import { CSCAmountPipe } from '../../domains/csc.pipes';
import { AppConstants } from '../../domains/app-constants';
import { CSCAmountPipe } from '../../domains/csc.pipes';

import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LedgerStreamMessages, TokenType, Payment, WalletDefinition } from '../../domains/csc-types';
import Big from 'big.js';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  columnCount: number;
  tokenlist: Array<TokenType>

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
  showLedgerDialog: boolean;
  showAddTokenDialog: boolean;
  showAddCSCDialog: boolean;
  signAndSubmitIcon: string;
  translateParams = {accountReserve: '10'};
  cscBalance: string;
  canActivateToken: boolean;
  currentToken: TokenType;

  mainCSCAccountID: string;
  availableTokenlist: Array<TokenType> = [];
  addToken: TokenType;
  addIcon = 'fa fa-plus';
  footer_visible = false;
  error_message: string;
  cscAccounts: Array<any> = [];
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
  constructor(private logger: LogService,
               private walletService: WalletService,
               // private marketService: MarketService,
               private casinocoinService: CasinocoinService,
               private sessionStorageService: SessionStorageService,
               private localStorageService: LocalStorageService,
               private currencyPipe: CurrencyPipe,
               private translate: TranslateService,
              public actionSheetController: ActionSheetController,
              public modal: ModalController,
               private cscAmountPipe: CSCAmountPipe
             ) {
               this.numberOfTokenAccounts = new Array(1).fill(0);

             }

             ngOnInit() {
               this.isLoading = true;
               this.logger.debug('### Wallet Page: ngOnInit() ###');
               this.columnCount = 5;

               // refresh server list
               this.casinocoinService.updateServerList();
               // connect to CasinoCoin network
               this.casinocoinService.connectSubject.subscribe( result => {
                 if (result === AppConstants.KEY_CONNECTED) {
                   // translation parameters
                   // this.translateParams = {accountReserve: this.casinocoinService.serverInfo.reserveBaseCSC};
                   // refresh Accounts
                   this.logger.debug('### WalletPage: Account Refresh');
                   this.casinocoinService.refreshAccounts().subscribe(accountRefreshFinished => {
                     if (accountRefreshFinished) {
                       // refresh Token List
                       this.logger.debug('### Wallet Page: TokenList Refresh');
                       this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
                         if (finished) {
                           this.tokenlist = this.casinocoinService.tokenlist;
                           this.numberOfTokenAccounts = new Array(this.tokenlist.length).fill(0);
                           this.logger.debug('### WalletPage TokenList: ' + JSON.stringify(this.tokenlist));
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
                   this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
                   this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
                   this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
                 }
               });
               this.walletService.openWalletSubject.subscribe( result => {
                 if (result === AppConstants.KEY_LOADED) {
                   // get the main CSC AccountID
                   this.mainCSCAccountID = this.walletService.getMainAccount().accountID;
                   // get all CSC accounts for add token dropdown
                   this.walletService.getAllAccounts().forEach( element => {
                     if (element.currency === 'CSC' && new Big(element.balance) > 0 && element.accountSequence >= 0) {
                        const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                           this.cscAmountPipe.transform(element.balance, false, true) + ']';
                       this.cscAccounts.push({label: accountLabel, value: element.accountID});
                     }
                   });
                   // subscribe to account updates
                   this.casinocoinService.accountSubject.subscribe( account => {
                     this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
                     this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
                     this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
                     // refresh all CSC accounts for add token dropdown
                     this.cscAccounts = [];
                     this.walletService.getAllAccounts().forEach( element => {
                       if (element.currency === 'CSC' && new Big(element.balance) > 0  && element.accountSequence >= 0) {
                          const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                             this.cscAmountPipe.transform(element.balance, false, true) + ']';
                         this.cscAccounts.push({label: accountLabel, value: element.accountID});
                       }
                     });
                     this.isLoading = false;
                   });
                 }
               });

             }
             async presentActionSheet() {
                  const actionSheet = await this.actionSheetController.create({
                    header: 'Add',
                    buttons: [{
                      text: 'Add CSC Account',
                      role: 'destructive',
                      icon: 'add',
                      handler: () => {
                        console.log('Delete clicked');
                        this.addCSCAccount();
                      }
                    }, {
                      text: 'Add token',
                      icon: 'add',
                      handler: () => {
                        console.log('Share clicked');
                        this.onAddToken();
                      }
                    }, {
                      text: 'Show ledgers',
                      icon: 'casino-coin',
                      handler: () => {
                        console.log('Play clicked');
                      }
                    }]
                  });
                  await actionSheet.present();
                }
                doAddToken() {
                  // this.logger.debug('### Wallet Page: Add Token: ' + this.addToken.Token + ' for: ' + this.selectedCSCAccount);
                  // const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
                  // if (this.walletService.checkWalletPasswordHash(this.walletPassword, walletObject.walletUUID, walletObject.passwordHash)) {
                  //   this.addIcon = 'pi fa-spin pi-spinner';
                  //   this.addTokenToAccount(this.addToken, this.walletPassword, this.selectedCSCAccount);
                  // } else {
                  //   this.footer_visible = true;
                  //   this.error_message = 'You entered the wrong wallet password!';
                  //   this.addIcon = 'fa fa-plus';
                  //   this.renderer.selectRootElement('#float-input-password').value = '';
                  //   this.renderer.selectRootElement('#float-input-password').focus();
                  // }
                }
                onAddToken(){
                    console.log("cscAccounts: ",this.cscAccounts);
                    console.log("tokens: ",this.availableTokenlist);
                    this.modal
                    .create({
                      component: AddTokenComponent,
                      componentProps: {
                        cscAccounts:this.cscAccounts,
                        availableTokenlist:this.availableTokenlist
                      }
                    }).then(
                      addTokenModal => {
                        addTokenModal.present();
                        return addTokenModal.onDidDismiss();
                      }).then(
                        resultData => {
                          if(resultData.role === "addToken"){

                            this.addTokenToAccount(resultData.data.token,resultData.data.account)
                          }
                        });
                }
                addCSCAccount(){
                  this.logger.debug('### WalletPage: add CSC account');
                  const password = '1234567';
                  this.walletPassword = password;
                  const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
                  if (this.walletService.checkWalletPasswordHash(this.walletPassword, walletObject.walletUUID, walletObject.passwordHash)){
                    this.logger.debug('### WalletPage: password OK adding account');
                    this.walletService.addCSCAccount(password);
                    this.casinocoinService.refreshAccountTokenList().subscribe( refreshResult => {
                      if (refreshResult) {
                        this.tokenlist = this.casinocoinService.tokenlist;
                      }
                    });
                  }else{
                    this.logger.debug('### WalletPage: password WRONG not adding account');
                  }

                }

                addTokenToAccount(token, accountID) {
                  this.logger.debug('### WalletPage: add Token to CSC account');
                  const password = '1234567';
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
                          this.tokenlist = this.casinocoinService.tokenlist;
                        }
                      });
                      // reset addToken, password and close dialog
                      this.addToken = null;
                      this.walletPassword = '';

                    });

                    }else{
                      this.logger.debug('### WalletPage: addtoken password WRONG not adding account');
                    }

                }



}
