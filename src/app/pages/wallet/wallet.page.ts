import { Component, OnInit } from '@angular/core';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { LogService } from '../../providers/log.service';
// import { MarketService } from '../../providers/market.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { AppConstants } from '../../domains/app-constants';
// import { CSCAmountPipe } from '../../domains/csc.pipes';

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
  tokenlist: Array<TokenType>;
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
  cscAccounts: string[] = [];
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
               // private cscAmountPipe: CSCAmountPipe
             ) { }

             ngOnInit() {

               this.logger.debug('### TokenList ngOnInit() ###');
               this.columnCount = 5;


               // refresh server list
               this.casinocoinService.updateServerList();
               // connect to CasinoCoin network
               this.casinocoinService.connectSubject.subscribe( result => {
                 if (result === AppConstants.KEY_CONNECTED) {
                   // translation parameters
                   // this.translateParams = {accountReserve: this.casinocoinService.serverInfo.reserveBaseCSC};
                   // refresh Accounts
                   this.logger.debug('### Account Refresh');
                   this.casinocoinService.refreshAccounts().subscribe(accountRefreshFinished => {
                     if (accountRefreshFinished) {
                       // refresh Token List
                       this.logger.debug('### TokenList Refresh');
                       this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
                         if (finished) {
                           this.tokenlist = this.casinocoinService.tokenlist;
                           this.logger.debug('### TokenList: ' + JSON.stringify(this.tokenlist));
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
                       // const accountLabel = element.accountID.substring(0, 20) + '...' + ' [Balance: ' +
                       //                     this.cscAmountPipe.transform(element.balance, false, true) + ']';
                       // this.cscAccounts.push({label: accountLabel, value: element.accountID});
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
                         // const accountLabel = element.accountID.substring(0, 20) + '...' + ' [Balance: ' +
                         //                     this.cscAmountPipe.transform(element.balance, false, true) + ']';
                         // this.cscAccounts.push({label: accountLabel, value: element.accountID});
                       }
                     });
                   });
                 }
               });
             }

}
