import { Component, OnInit } from '@angular/core';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { AppflowService } from '../../providers/appflow.service';
import { LogService } from '../../providers/log.service';
import { MarketService } from '../../providers/market.service';
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
  walletBalances: any[];
  fiat_balance: string;
  fiatValue = '0.00';
  coinSupply = '40000000000';
  marketCapital = '0.00';
  marketVolumeUSD = '0.00';

  constructor(private logger: LogService,
               private walletService: WalletService,
               private marketService: MarketService,
               private appflow: AppflowService,
               private casinocoinService: CasinocoinService,
               private sessionStorageService: SessionStorageService,
               private localStorageService: LocalStorageService,
               private currencyPipe: CurrencyPipe,
               private translate: TranslateService
             ) { }

  ngOnInit() {
    this.appflow.tokenlist.subscribe(
      tokenList => {
        // this.tokenlist = tokenList;
        this.appflow.updateBalance(tokenList);
        if(tokenList){
          this.appflow.getAllTokenBalances().subscribe(walletBalances => {
            this.walletBalances = walletBalances;
            this.logger.debug('### ***************************************************************HOME - Wallet Balances: ' + JSON.stringify(this.walletBalances));
            // this.balance = CSCUtil.dropsToCsc(this.walletBalance);
            const coinInfo = this.marketService.getCoinInfo();
            this.fiatValue  = coinInfo.price_usd ;
            this.coinSupply = coinInfo.total_supply;
            this.marketCapital = coinInfo.market_cap_usd;
            this.marketVolumeUSD = coinInfo.market_24h_volume_usd;
            if(walletBalances){
                walletBalances.forEach( wallet =>{
                  if(wallet.token == 'CSC'){
                    const balanceCSC = new Big(CSCUtil.dropsToCsc(wallet.balance));
                    if (this.marketService.coinMarketInfo != null && this.marketService.coinMarketInfo.price_fiat !== undefined) {
                      const fiatValue = balanceCSC.times(new Big(this.marketService.coinMarketInfo.price_fiat)).toString();
                      this.fiat_balance = this.currencyPipe.transform(fiatValue, this.marketService.coinMarketInfo.selected_fiat, 'symbol', '1.2-2');
                      this.logger.debug('### **************************************************************************wallet balance: ' + wallet.balance + ' BTC: ' + this.marketService.btcPrice + ' FiatValue: ' + this.fiatValue);
                    }

                  }
                })
            }
          });
        }

      });

    // get the complete wallet object
    // this.currentWalletObject = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    // this.logger.info('### HOME currentWallet: ' + JSON.stringify(this.currentWalletObject));
     // this.doBalanceUpdate();

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
  renderCSCAmount(amount){
    return CSCUtil.dropsToCsc(amount);
  }




}
