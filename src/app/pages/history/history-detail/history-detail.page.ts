import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { LogService } from '../../../providers/log.service';
// import { LokiTransaction } from '../../../domains/csc-types';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { WalletService } from '../../../providers/wallet.service';
import { AppConstants } from '../../../domains/app-constants';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
})
export class HistoryDetailPage implements OnInit {

  transactionLoaded:any;
  currentWalletObject:any;
  constructor(
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private casinocoinService: CasinocoinService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private logger: LogService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('transactionId')){
        //redirect
        return;
      }else{
        const transactionId = paramMap.get('transactionId');
        this.logger.debug("History Detail Page: getting token account object: "+transactionId);
        this.transactionLoaded = this.walletService.getTransaction(transactionId);
        if(!this.transactionLoaded){

          // get the complete wallet object
          this.currentWalletObject = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
          this.logger.info('### History Detail Page: currentWallet: ' + JSON.stringify(this.currentWalletObject));
          // check if wallet is open else open it
          this.walletService.openWalletSubject.subscribe( result => {
            if (result === AppConstants.KEY_INIT) {
              this.logger.debug('### History Detail Page: Wallet INIT');
              // wallet not opened yet so open it
              this.walletService.openWallet(this.currentWalletObject.walletUUID);
            } else if (result === AppConstants.KEY_OPENING) {
              this.logger.debug('### History Detail Page: Wallet OPENING');
            } else if (result === AppConstants.KEY_LOADED) {
              this.logger.debug('### History Detail Page: Wallet LOADED');
              this.transactionLoaded = this.walletService.getTransaction(transactionId);
              this.logger.debug("History Detail Page: getting token account object: "+JSON.stringify(this.transactionLoaded));
              // this.doBalanceUpdate();
              // this.listenForMainEvents();
              // load the account list
              this.walletService.getAllAccounts().forEach( element => {
                if (element.currency === 'CSC') {
                  const accountLabel = element.label + ' - ' + element.accountID;
                  // this.accounts.push({label: accountLabel, value: element.accountID});
                }
              });
            }  else if (result === AppConstants.KEY_CLOSED) {
              this.logger.debug('### Main Page: Wallet CLOSED');
              // this.electron.ipcRenderer.send('wallet-closed', true);
            }
          });


      }


      }
    });
  }
  copyAccountID(text){
    this.clipboard.copy(text);
  }
}
