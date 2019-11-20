import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AddTokenComponent } from './add-token/add-token.component';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { LogService } from '../../providers/log.service';
import { MarketService } from '../../providers/market.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto }  from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { CSCAmountPipe } from '../../domains/csc.pipes';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet.service';
import { AppflowService } from '../../providers/appflow.service';
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
               private appflow: AppflowService,
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
                   this.appflow.tokenlist.subscribe(
                     tokenList => {
                       this.tokenlist = tokenList;
                       console.log("???????????????????????????????????AAAAAAAAA??????????????????????????????????");
                       console.log(this.tokenlist);
                       this.isLoading = false;
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
