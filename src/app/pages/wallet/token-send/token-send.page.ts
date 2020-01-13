import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { NavController } from '@ionic/angular';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { AppflowService } from '../../../providers/appflow.service';
import { LogService } from '../../../providers/log.service';
// import { LokiTransaction } from '../../../domains/csc-types';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { WalletService } from '../../../providers/wallet.service';
import { AppConstants } from '../../../domains/app-constants';
import { WalletDefinition } from '../../../domains/csc-types';
import { CSCCrypto } from '../../../domains/csc-crypto';
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
destinationTag: string;
destinationLabel: string;
reserveIncrement: string;
tokenAccountLoaded: any;
balanceToSend: any;

  constructor(
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private nav: NavController,
    private casinocoinService: CasinocoinService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private appflow: AppflowService,
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
  async scanQRCode(){
    let data = await this.appflow.scanQRCode();
    this.logger.debug("#### DATA ON QR::: "+JSON.stringify(data));
    this.destinationAccount = data.address;
    if(data.label){
      this.destinationLabel = data.label;
    }
    if(data.destinationTag){
      this.destinationTag = data.destinationTag;
    }


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
  async onSendFormSubmit(form) {
    const value = form.value;
    const status  = form.status;
    if(status == "INVALID"){

      console.log(form);
      return false;
    }
    this.logger.debug('### onSendFormSubmit: ' + JSON.stringify(value));
    // const password ='1234567';
    // check password
    const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    const result = await this.appflow.onValidateTx("addToken", "Enter your PIN to authorize transaction");
    if(result.data.state){

      // check the destination account id
      if (this.casinocoinService.isValidAccountID(value.from.trim())) {
        if (!isNaN(value.amount)) {
          // get the account secret for the CSC account
          const accountKey = this.walletService.getKey(this.tokenAccountLoaded.AccountID);
          this.logger.debug('### send accountID: ' + JSON.stringify(value.from));
          this.logger.debug('### send accountKey: ' + JSON.stringify(accountKey));
          // prepare, sign and send the transaction
          const instructions = { maxLedgerVersionOffset: 5, fee: this.fees };
          const payment: any = {
            source: {
              address: this.tokenAccountLoaded.AccountID,
              maxAmount: { value: ""+value.amount+"", currency: this.tokenAccountLoaded.Token }
            },
            destination: {
              address: value.to.trim(),
              amount: { value: ""+value.amount+"", currency: this.tokenAccountLoaded.Token }
            },
            allowPartialPayment: false
          };
          if (this.tokenAccountLoaded.Token !== 'CSC') {
            payment.source.maxAmount['counterparty'] = this.tokenAccountLoaded.Issuer;
            payment.destination.amount['counterparty'] = this.tokenAccountLoaded.Issuer;
          }
          // add destination tag if present
          if (value.destinationtag > 0) {
            payment.destination.tag = value.destinationtag;
          }
          // add description if present
          this.logger.debug('### Payment object:  value.description resulted in ' + value.description);

          if (value.description !== undefined && value.description !== null  && value.description.length > 0) {
            payment.memos = [{data: value.description, format: 'plain/text'}];
          }

          this.logger.debug('### Payment object: ' + JSON.stringify(payment));
          this.casinocoinService.cscAPI.preparePayment(this.tokenAccountLoaded.AccountID, payment, instructions).then(prepared => {
            this.logger.debug('### Prepared: ' + JSON.stringify(prepared));
            const cscCrypto = new CSCCrypto(result.data.password, this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET).userEmail);
            const decryptedSecret = cscCrypto.decrypt(accountKey.secret);
            return this.casinocoinService.cscAPI.sign(prepared.txJSON, decryptedSecret);
          }).then( signResult => {
            this.logger.debug('### Sign Result: ' + JSON.stringify(signResult));
            return this.casinocoinService.cscAPI.submit(signResult.signedTransaction);
          }).then( submitResult => {
            this.logger.debug('### Submit Result: ' + JSON.stringify(submitResult));
            this.nav.navigateBack("/tabs/wallet");
            // this.sendForm.reset();
          }).catch( error => {
            this.logger.debug('### ERROR: ' + JSON.stringify(error));
            // this.error_message = error;
            // this.sendForm.reset();
          });
        } else {
          // this.error_message = 'Entered value for amount is not valid';
          console.log("####### entered value for amount is not valid")
    //       this.showErrorDialog = true;
        }
      } else {
        // this.error_message = 'Invalid destination AccountID';
        // this.showErrorDialog = true;
        console.log("####### Invalid destination AccountID")
      }
    } else {
      console.log("####### Wrong wallet password")
    //   this.error_message = 'You entered the wrong wallet password!';
    //   this.showErrorDialog = true;
    //   this.renderer.selectRootElement('#float-input-password').value = '';
    //   this.renderer.selectRootElement('#float-input-password').focus();
    }
  }
  onCancel(){
    this.nav.navigateBack("/tabs/wallet");
  }

}
