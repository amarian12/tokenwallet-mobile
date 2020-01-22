import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AddTokenComponent } from '../add-token/add-token.component';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { AppflowService } from '../../../providers/appflow.service';
import { TokenType } from '../../../domains/csc-types';
import { LogService } from '../../../providers/log.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { timer } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.page.html',
  styleUrls: ['./token-detail.page.scss'],
})
export class TokenDetailPage implements OnInit {
  tokenAccountLoaded: TokenType;
  fees: string;
  accountReserve: string;
  reserveIncrement: string;
  copyIcon: string = 'copy';
  copyToIcon: string = 'copy';
  copyFromIcon: string = 'copy';

  constructor(
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private casinocoinService: CasinocoinService,
    public modal: ModalController,
    private logger: LogService,
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
  ionViewWillEnter(){
    this.tokenSubject = this.casinocoinService.tokenlistSubject.subscribe(
      tokenList => {
        let pkID = this.tokenAccountLoaded.PK;
        this.tokenAccountLoaded = {...tokenList.find( token => token.PK === pkID)};
        this.logger.debug("Token Detail Page: getting token account object result: "+JSON.stringify(this.tokenAccountLoaded));

      }
    );
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
    return  'http://testexplorer.casinocoin.org/address/' + this.tokenAccountLoaded.AccountID;
  }


}
