import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { NavController, AlertController, IonSelect } from '@ionic/angular';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { AppflowService } from '../../../providers/appflow.service';
import { LogService } from '../../../providers/log.service';
// import { LokiTransaction } from '../../../domains/csc-types';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { WalletService } from '../../../providers/wallet.service';
import { AppConstants } from '../../../domains/app-constants';
import { WalletDefinition } from '../../../domains/csc-types';
import { CSCCrypto } from '../../../domains/csc-crypto';
import { TranslateService } from '@ngx-translate/core';
import { CSCUtil } from '../../../domains/csc-util';

@Component({
  selector: 'app-token-send',
  templateUrl: './token-send.page.html',
  styleUrls: ['./token-send.page.scss'],
})
export class TokenSendPage implements OnInit {
fees: string;
contactList: Array<any>;
selectedContact:any;
hideContactSelect= true;
theme:string;
originAccount: string;
accountReserve: string;
destinationAccount: string;
toAccount: string;
destinationTag: string;
destinationLabel: string;
reserveIncrement: string;
errorMessageList: string[];
tokenAccountLoaded: any;
balanceToSend: any;
@ViewChild('contactSelect',{static: false}) contactSelectEl: IonSelect;

  constructor(
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private nav: NavController,
    private alert: AlertController,
    private translate: TranslateService,
    private casinocoinService: CasinocoinService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private appflow: AppflowService,
    private logger: LogService
  ) { }

  ngOnInit() {
    this.translate.get('PAGES.WALLET.TOKEN-SEND.ERRORS').subscribe((res: string[]) => {
        this.errorMessageList = res;
        this.logger.debug('### Add Token Page ::: Errors list: ' + JSON.stringify(this.errorMessageList));
    });
    this.appflow.contacts.subscribe(
      contacts => {
        this.logger.debug('### Token Send Page. Contacts found through subject: '+ JSON.stringify(contacts));
        this.contactList = contacts || [];
        if (!this.contactList || this.contactList.length <= 0){
           this.logger.debug("### Token Send Page :: Contacts length :"+JSON.stringify(this.contactList.length));

          }else{
            this.logger.debug("### Token Send Page :: Contacts length :"+JSON.stringify(this.contactList.length));


          }

    });
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
          this.casinocoinService.tokenlistSubject.subscribe(tokenlist => {
              this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(pkID);
              this.logger.debug("Send Token Page: getting token account object after refresh: "+JSON.stringify(this.tokenAccountLoaded));
              if(this.tokenAccountLoaded){
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

          if(!paramMap.has('desttag')){

            //redirect
            return;
          }else{
            this.destinationTag = paramMap.get('desttag');
            this.logger.debug("### send token page: destination: " + this.destinationTag);
          }
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

      this.logger.debug("####### Send Token Page: ERROR: send form is not valid");
      if(value.to == ""){
        this.logger.debug("####### Send Token Page: You must enter a destination account");
        const errorName = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['SUBHEADER-IN'],
          message:this.errorMessageList['MSG-DESTEMPTY'],
          okbtn:this.errorMessageList['BTN-OK']
        }
        this.displayError(errorName);
        return false;
      }

    }
    this.logger.debug('### onSendFormSubmit: ' + JSON.stringify(value));
    // const password ='1234567';
    // check password
    const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    const result = await this.appflow.onValidateTx("addToken", "Enter your PIN to authorize transaction", this.theme);
    if(result.data.state){

      // check the origin account id
      if (!this.casinocoinService.isValidAccountID(value.from.trim())) {
        const errorValidAct = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['SUBHEADER-NP'],
          message:this.errorMessageList['MSG-ACTINVALID'],
          okbtn:this.errorMessageList['BTN-OK']
        }
        this.displayError(errorValidAct);
        console.log("####### Invalid origin AccountID");
        return false;
      }
        // check the destination account id
      if (this.casinocoinService.isValidAccountID(value.to.trim())) {
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
            const errorUnexpected = {
              header:this.errorMessageList['HEADER'],
              subheader:this.errorMessageList['SUBHEADER-UE'],
              message:error,
              okbtn:this.errorMessageList['BTN-OK']
            }
            this.displayError(errorUnexpected);
            return false;

            // this.error_message = error;
            // this.sendForm.reset();
          });
        } else {
          // this.error_message = 'Entered value for amount is not valid';
          const errorAmount = {
            header:this.errorMessageList['HEADER'],
            subheader:this.errorMessageList['SUBHEADER-NP'],
            message:this.errorMessageList['MSG-AMTINVALID'],
            okbtn:this.errorMessageList['BTN-OK']
          }
          this.displayError(errorAmount);
          console.log("####### entered value for amount is not valid");
          return false;
    //       this.showErrorDialog = true;
        }
      } else {
        // this.error_message = 'Invalid destination AccountID';
        // this.showErrorDialog = true;
        const errorDestination = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['SUBHEADER-NP'],
          message:this.errorMessageList['MSG-DESTINVALID'],
          okbtn:this.errorMessageList['BTN-OK']
        }
        this.displayError(errorDestination);
        console.log("####### Invalid destination AccountID");
        return false;
      }
    } else {
      console.log("####### Wrong wallet password");
      const errorPIN = {
        header:this.errorMessageList['HEADER'],
        subheader:this.errorMessageList['SUBHEADER-NP'],
        message:this.errorMessageList['MSG-PININVALID'],
        okbtn:this.errorMessageList['BTN-OK']
      }
      this.displayError(errorPIN);
      return false;
    //   this.error_message = 'You entered the wrong wallet password!';
    //   this.showErrorDialog = true;
    //   this.renderer.selectRootElement('#float-input-password').value = '';
    //   this.renderer.selectRootElement('#float-input-password').focus();
    }
  }
  ionViewWillEnter(){
      this.theme = this.appflow.dark ? "dark":"light";
    }
  onCancel(){
    this.nav.navigateBack("/tabs/wallet");
  }
  contactSelected(){
    this.contactSelectEl.open();
  }
  setToContact(){
    let contact  = this.contactList.find(contact => contact.$loki  === this.selectedContact);
    this.toAccount = contact.accountID;
    if(contact.destinationTag){
      this.destinationTag = contact.destinationTag;
    }
  }

}
