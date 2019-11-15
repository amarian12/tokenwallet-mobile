import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LogService } from '../../providers/log.service';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { WalletService } from '../../providers/wallet.service';
import { CSCUtil } from '../../domains/csc-util';
import { AppConstants } from '../../domains/app-constants';
import Big from 'big.js';
import { LokiTransaction } from '../../domains/lokijs';



@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  constructor(private logger: LogService,
              private casinocoinService: CasinocoinService,
              private walletService: WalletService,
              private router: Router,
              private route: ActivatedRoute) { }

  transactions: Array<LokiTransaction> = [];
  currentTX: LokiTransaction;
  lastRefreshed = "";

  ngOnInit() {
    this.logger.debug('### History Page:  ngOnInit() ###');
    this.walletService.openWalletSubject.subscribe( result => {
      if (result === AppConstants.KEY_LOADED) {
        // get all transactions
        this.transactions = this.walletService.getAllTransactions();
        this.logger.debug('### History ngOnInit() - transactions: ' + JSON.stringify(this.transactions));
      }
    });
    // delayed transactions get:
    // const accounts = this.walletService.getAllAccounts();
    // this.logger.debug("### History ngOnInit:  accounts: "+JSON.stringify(accounts));
    // accounts.forEach(
    //   act =>  {
    //     if(act.lastTxLedger > 0){
    //       this.casinocoinService.syncDelayedTx(act.accountID,act.lastTxLedger);
    //     }
    //   });
  }
  ionViewWillEnter(){
    // delayed transactions get:
    const accounts = this.walletService.getAllAccounts();
    this.logger.debug("### History ionViewWillEnter:  accounts: "+JSON.stringify(accounts));
    accounts.forEach(
      act =>  {
        if(act.lastTxLedger > 0){
          this.casinocoinService.syncDelayedTx(act.accountID,1);
        }
      });
    }
  getStatusIconColor(tx: LokiTransaction) {
    if (tx.validated) {
      return "success";
    } else if ((this.casinocoinService.ledgers[0] !== undefined) && (tx.lastLedgerSequence > this.casinocoinService.ledgers[0].ledger_index)) {
      return "warning";
    } else {
      return "danger";
    }
  }
  getStatusIconClasses(tx: LokiTransaction) {
    if (tx.validated) {
      return "icon ion-md-icon-plus";
    } else if ((this.casinocoinService.ledgers[0] !== undefined) && (tx.lastLedgerSequence > this.casinocoinService.ledgers[0].ledger_index)) {
      return "icon ion-md-icon-minus";
    } else {
      return "icon ion-md-icon-minus";
    }
  }

  getStatusTooltipText(tx: LokiTransaction) {
    if (tx.validated) {
      return 'Transaction validated and final.';
    } else if ((this.casinocoinService.ledgers[0] !== undefined) && (tx.lastLedgerSequence > this.casinocoinService.ledgers[0].ledger_index)) {
      return 'Transaction not yet validated. Waiting to be included until ledger ' + tx.lastLedgerSequence +
              ' (current ledger: ' + this.casinocoinService.ledgers[0].ledger_index + ').';
    } else {
      return 'Transaction cancelled.';
    }
  }

  getDescription(rowData) {
    if (rowData.memos && rowData.memos.length > 0) {
      return rowData.memos[0].memo.memoData;
    } else {
      return null;
    }
  }

  getTokenURL(rowData) {
    if (rowData.currency === 'CSC') {
      return 'https://github.com/casinocoin/CasinoCoin-Assets/raw/master/v4/casinocoin-icon-256x256.png';
    } else {
      const token = this.casinocoinService.getTokenInfo(rowData.currency);
      if (token !== undefined) {
        return token.IconURL;
      } else {
        return '';
      }
    }
  }

}
