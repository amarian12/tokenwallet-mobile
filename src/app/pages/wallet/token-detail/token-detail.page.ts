import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LokiKey} from '../../../domains/lokijs';
import { CSCCrypto }  from '../../../domains/csc-crypto';
import { ModalController, AlertController } from '@ionic/angular';
import { AddTokenComponent } from '../add-token/add-token.component';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { WalletService } from '../../../providers/wallet.service';
import { AppflowService } from '../../../providers/appflow.service';
import { TokenType } from '../../../domains/csc-types';
import { LogService } from '../../../providers/log.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Subscription, timer } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.page.html',
  styleUrls: ['./token-detail.page.scss'],
})
export class TokenDetailPage implements OnInit {
  tokenAccountLoaded: TokenType;
  tokenListSubject: Subscription;
  fees: string;
  accountReserve: string;
  reserveIncrement: string;
  copySecret: string = 'copy';
  copyIcon: string = 'copy';
  copyToIcon: string = 'copy';
  copyFromIcon: string = 'copy';
  theme:string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private casinocoinService: CasinocoinService,
    private walletService: WalletService,
    public modal: ModalController,
    public alert: AlertController,
    private logger: LogService,
    public iab: InAppBrowser,
    private appflow: AppflowService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('tokenId')){
        //redirect
        return;
      }else{

         const tokenId = paramMap.get('tokenId');

         this.logger.debug("Token Detail Page: getting token account object: "+tokenId);
        // this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
         this.appflow.getTokenAccount(tokenId).subscribe(
          token => {
              this.tokenAccountLoaded = token
              // this.logger.debug("Token Detail Page: getting token account object result: "+JSON.stringify(this.tokenAccountLoaded));
          });

          // this.tokenlist.pipe(take(1),map(tokenList => {
          //    return {...tokenList.find( token => token.PK === pkID)};
          // }));

         this.appflow.transactionParams.subscribe(
           transactionParams => {
             this.fees = transactionParams.fees;
             this.accountReserve = transactionParams.accountReserve;
             this.reserveIncrement = transactionParams.reserveIncrement;

           });
        // if(this.casinocoinService.serverInfo){
        //   this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
        //   this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
        //   this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
        //
        // }
        // if(!this.tokenAccountLoaded){
        //
        //   this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
        //     if (finished) {
        //       this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
        //       this.logger.debug("Token Detail Page: getting token account object after refresh: "+JSON.stringify(this.tokenAccountLoaded));
        //       this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
        //       this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
        //       this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
        //
        //     }
        //   });
        // }

      }


    });

  }
  async getSecret(){

    const result = await this.appflow.onValidateTx("ImportAccount","Enter PIN to authorize obtaining secret",this.theme);
    if(result && result.data.state){
      const secretsCSCCrypto = new CSCCrypto(result.data.password, result.data.email);
      const actKey: LokiKey = this.walletService.getKey(this.tokenAccountLoaded.AccountID);
      const actDecryptedSecret = secretsCSCCrypto.decrypt(actKey.secret);
      console.log(actDecryptedSecret);
      let secretmodal = await this.alert.create({
        header: 'Show secret',
        subHeader: "this is the secret for "+this.tokenAccountLoaded.AccountLabel,
        message: "<small>"+actDecryptedSecret+"</small>",
          buttons: [
          {
            text: 'Copy',
            role: 'copy',
            cssClass: 'secondary',
            handler: (data) => {
              this.logger.debug("### Token Detail Page:: secret copied");
              // console.log(this);

              this.copySecretString(actDecryptedSecret);

            }
          }, {
            text: 'Ok',
            handler: (data) => {
              this.logger.debug("### Token Detail Page:: secret copied");

            }
          }
        ]

      });
      await secretmodal.present();

    }
    // console.log(result);

  }
  ionViewWillEnter(){
    this.tokenListSubject = this.casinocoinService.tokenlistSubject.subscribe(
      tokenList => {
        let pkID = this.tokenAccountLoaded.PK;
        this.tokenAccountLoaded = {...tokenList.find( token => token.PK === pkID)};
        this.logger.debug("Token Detail Page: getting token account object result: "+JSON.stringify(this.tokenAccountLoaded));

      }
    );
      this.theme = this.appflow.dark ? "dark":"light";
  }
  IonViewDidLeave(){
    this.tokenListSubject.unsubscribe();
    this.logger.debug("Token Detail Page: Subscription to tokenlist closed ");
  }

  onAddToken(){
      // console.log("cscAccounts: ",this.cscAccounts);
      // console.log("tokens: ",this.availableTokenlist);
      // this.modal
      // .create({
      //   component: AddTokenComponent,
      //   componentProps: {
      //     cscAccounts:[this.tokenAccountLoaded],
      //     availableTokenlist:[]
      //   }
      // }).then(
      //   addTokenModal => {
      //     addTokenModal.present();
      //     return addTokenModal.onDidDismiss();
      //   }).then(
      //     resultData => {
      //       if(resultData.role === "addToken"){
      //
      //         // this.addTokenToAccount(resultData.data.token,resultData.data.account)
      //
      //       }
      //     });
  }
  getTotalReserved(tokenObject) {
    return Number(this.accountReserve) + (Number(tokenObject.OwnerCount) *  Number(this.reserveIncrement));
  }
  copySecretString(text){
    this.clipboard.copy(text);
    this.copySecret = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copySecret = 'copy';
    });
  }
  copyAccountID(text){
    this.clipboard.copy(text);
    this.copyIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyIcon = 'copy';
    });
  }
  copyToAccountID(text){
    this.clipboard.copy(text);
    this.copyToIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyToIcon = 'copy';
    });
  }
  copyFromAccountID(text){
    this.clipboard.copy(text);
    this.copyFromIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyFromIcon = 'copy';
    });
  }
  getExploreURL(){
    return  'https://csc.observer/account/'+this.tokenAccountLoaded.AccountID+'?testnet=true';
    //return  'http://testexplorer.casinocoin.org/address/' + this.tokenAccountLoaded.AccountID;

  }
  openObserverURL(){
    const link = 'https://csc.observer/account/'+this.tokenAccountLoaded.AccountID+'?testnet=true';
    this.logger.debug('### Wallet Token Detail Page:  open Observer URL : ' + link);
    this.iab.create(link, "_system");
    //return  'http://testexplorer.casinocoin.org/tx/' + this.transactionLoaded.txID;
  }
  async editLabel(){
    let editbox = await this.alert.create({
      header: 'Account Label',
      subHeader: "You can modify your Account Label here.",
      inputs:[{
          name: 'label',
          type: 'text',
          id: 'label',
          value: this.tokenAccountLoaded.AccountLabel
        },],
        buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (data) => {
            this.logger.debug("### Token Detail Page:: Edit label cancelled");


          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.tokenAccountLoaded.AccountLabel = data.label;

            let account = this.walletService.getAccount(this.tokenAccountLoaded.Token, this.tokenAccountLoaded.AccountID);
            this.logger.debug("### Token Detail Page:: Succesfully retrieved token Account from collection"+JSON.stringify(account));
            account.label = data.label;
            //update on tokenlist from casinocoinservice
            const item = this.casinocoinService.tokenlist.find(token => token.PK == this.tokenAccountLoaded.PK);
            const itemIndex = this.casinocoinService.tokenlist.indexOf(item);
            this.casinocoinService.tokenlist[itemIndex] = this.tokenAccountLoaded;
            //update on collection
             this.walletService.updateAccount(account);
             this.logger.debug("### Token Detail Page:: Succesfully updated token Account with new label"+JSON.stringify(this.tokenAccountLoaded));
          }
        }
      ]

    });
    await editbox.present();
  }
}
