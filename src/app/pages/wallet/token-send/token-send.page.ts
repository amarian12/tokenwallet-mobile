import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { LogService } from '../../../providers/log.service';
// import { LokiTransaction } from '../../../domains/csc-types';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { WalletService } from '../../../providers/wallet.service';
import { AppConstants } from '../../../domains/app-constants';
import { CSCUtil } from '../../../domains/csc-util';

@Component({
  selector: 'app-token-send',
  templateUrl: './token-send.page.html',
  styleUrls: ['./token-send.page.scss'],
})
export class TokenSendPage implements OnInit {

fees: string;
originAccount: string;
accountReserve: string;
destinationAccount: string;
reserveIncrement: string;
tokenAccountLoaded: any;
balanceToSend: any;

  constructor(
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private casinocoinService: CasinocoinService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private logger: LogService
  ) { }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('origin')){
        //redirect
        return;
      }else{
       const pkID = paramMap.get('origin');
        this.originAccount = pkID;
        this.logger.debug("### send token page: origin: " + this.originAccount);
        this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(pkID);
        this.logger.debug("### send token page: getting token account before refresh: " + JSON.stringify(this.tokenAccountLoaded));
        if(this.casinocoinService.serverInfo){
          this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
          this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
          this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;

        }
        if(!this.tokenAccountLoaded){

          this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
            if (finished) {
              this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(pkID);
              this.logger.debug("Send Token Page: getting token account object after refresh: "+JSON.stringify(this.tokenAccountLoaded));
              this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
              this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
              this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;

            }
          });
        }
        if(!paramMap.has('destination')){

          //redirect
          return;
        }else{
          this.destinationAccount = paramMap.get('destination');
          this.logger.debug("### send token page: destination: " + this.destinationAccount);
        }
      }
    });
  }
  getTotalReserved(tokenObject) {
    return Number(this.accountReserve) + (Number(tokenObject.OwnerCount) *  Number(this.reserveIncrement));
  }
  allBalanceToAmount(){

      if (this.tokenAccountLoaded.Token === 'CSC') {
        this.balanceToSend  = Number(CSCUtil.dropsToCsc(this.tokenAccountLoaded.Balance)) - this.getTotalReserved(this.tokenAccountLoaded) - Number(this.fees);
        this.logger.debug("### send token page: new balance to send: "+this.balanceToSend);
        // this.sendForm.controls.amount.setValue(sendMax.toString());
      } else {
        this.balanceToSend  = Number(CSCUtil.dropsToCsc(this.tokenAccountLoaded.TokenBalance));
        this.logger.debug("### send token page: new balance to send: "+this.balanceToSend);
        // this.sendForm.controls.amount.setValue(CSCUtil.dropsToCsc(rowData.TokenBalance));
      }
  }

}
