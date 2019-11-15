import { Component, OnInit } from '@angular/core';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { LogService } from '../../providers/log.service';
// import { MarketService } from '../../providers/market.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { AppConstants } from '../../domains/app-constants';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { WalletSettings, WalletDefinition, LedgerStreamMessages } from '../../domains/csc-types';
import Big from 'big.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentWalletObject: WalletDefinition;
  serverVersion: string;
  walletBalance: string;
  balance: string;
  fiat_balance: string;

  constructor(private logger: LogService,
               private walletService: WalletService,
               // private marketService: MarketService,
               private casinocoinService: CasinocoinService,
               private sessionStorageService: SessionStorageService,
               private localStorageService: LocalStorageService,
               private currencyPipe: CurrencyPipe,
               private translate: TranslateService
             ) { }

  ngOnInit() {

    // get the complete wallet object
    this.currentWalletObject = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    this.logger.info('### HOME currentWallet: ' + JSON.stringify(this.currentWalletObject));
    // check if wallet is open else open it
  //   this.walletService.openWalletSubject.subscribe( result => {
  //     if (result === AppConstants.KEY_INIT) {
  //       this.logger.debug('### HOME Wallet INIT');
  //       // wallet not opened yet so open it
  //       this.walletService.openWallet(this.currentWalletObject.walletUUID);
  //     } else if (result === AppConstants.KEY_OPENING) {
  //       this.logger.debug('### HOME Wallet OPENING');
  //     } else if (result === AppConstants.KEY_LOADED) {
  //       this.logger.debug('### HOME Wallet LOADED');
  //       // this.doBalanceUpdate();
  //       // this.listenForMainEvents();
  //       // load the account list
  //       this.walletService.getAllAccounts().forEach( element => {
  //         if (element.currency === 'CSC') {
  //           const accountLabel = element.label + ' - ' + element.accountID;
  //           // this.accounts.push({label: accountLabel, value: element.accountID});
  //         }
  //       });
  //     }  else if (result === AppConstants.KEY_CLOSED) {
  //       this.logger.debug('### HOME Wallet CLOSED');
  //       // this.electron.ipcRenderer.send('wallet-closed', true);
  //     }
  //   });
  //   this.casinocoinService.connect().subscribe( result => {
  //     if (result === AppConstants.KEY_CONNECTED) {
  //       this.serverVersion = this.casinocoinService.serverInfo.buildVersion;
  //       // this.setWalletUIConnected();
  //       this.casinocoinService.accountSubject.subscribe( account => {
  //         // one of the accounts got updated so update the balance
  //         // this.doBalanceUpdate();
  //         this.logger.debug('### CONECTED!');
  //       });
  //       // refresh available token list
  //       this.casinocoinService.refreshAvailableTokenList();
  //     } else {
  //       this.logger.debug('### DISCONECTED!');
  //       // we are not connected or disconnected
  //       // this.setWalletUIDisconnected();
  //     }
  //   });
  }
  
  // doBalanceUpdate() {
  //   this.walletBalance = this.walletService.getWalletBalance('CSC') ? this.walletService.getWalletBalance('CSC') : '0';
  //   this.logger.debug('### HOME - Wallet Balance: ' + this.walletBalance);
  //   this.balance = CSCUtil.dropsToCsc(this.walletBalance);
  //   const balanceCSC = new Big(this.balance);
  //   // if (this.marketService.coinMarketInfo != null && this.marketService.coinMarketInfo.price_fiat !== undefined) {
  //   //   this.logger.debug('### CSC Price: ' + this.marketService.cscPrice + ' BTC: ' + this.marketService.btcPrice + ' Fiat: ' + this.marketService.coinMarketInfo.price_fiat);
  //   //   const fiatValue = balanceCSC.times(new Big(this.marketService.coinMarketInfo.price_fiat)).toString();
  //   //   this.fiat_balance = this.currencyPipe.transform(fiatValue, this.marketService.coinMarketInfo.selected_fiat, 'symbol', '1.2-2');
  //   // }
  // }

}
