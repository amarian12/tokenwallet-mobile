import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AddTokenComponent } from './add-token/add-token.component';
import { CustomPinComponent } from '../login/custom-pin/custom-pin.component';
import { CasinocoinService } from '../../providers/casinocoin.service';
import { LogService } from '../../providers/log.service';
import { MarketService } from '../../providers/market.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { CSCUtil } from '../../domains/csc-util';
import { CSCCrypto }  from '../../domains/csc-crypto';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { AppConstants } from '../../domains/app-constants';
import { CSCAmountPipe } from '../../domains/csc.pipes';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet.service';
import { AppflowService } from '../../providers/appflow.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { LedgerStreamMessages, TokenType, Payment, WalletDefinition } from '../../domains/csc-types';
import Big from 'big.js';
import { timer } from 'rxjs';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  columnCount: number;
  tokenlist: Array<TokenType>
  copyIcon = 'copy';
  isLoading: boolean;
  ledgers: LedgerStreamMessages[] = [];
  receipient: string;
  description: string;
  theme:string;
  amount: string;
  fees: string;
  txResult: string;
  accountReserve: string;
  filterToken = "100";
  reserveIncrement: string;
  walletPassword: string;
  showPasswordDialog: boolean;
  showLedgerDialog: boolean;
  showAddTokenDialog: boolean;
  showAddCSCDialog: boolean;
  signAndSubmitIcon: string;
  translateParams = {accountReserve: '10'};
  errorMessageList:string[];
  cscBalance: string;
  canActivateToken: boolean;
  currentToken: TokenType;

  mainCSCAccountID: string;
  availableTokenlist: Array<TokenType> = [];
  addToken: TokenType;
  addIcon = 'fa fa-plus';
  footer_visible = false;
  error_message: string;
  cscAccounts: Array<any> = [];
  selectedCSCAccount: string;
  addTokenAccountSelected: boolean;
  showErrorDialog = false;

  public cscReceiveURI: string = null;
  showReceiveQRCodeDialog = false;
  sendAmount: string;
  destinationTag: number;
  label: string;

  showSecretDialog = false;
  showSecret = false;
  accountSecret: string;
  // numberOfTokenAccounts: Array<number> =[0];
  numberOfTokenAccounts: Array<number>;

  showEditAccountLabel = false;
  accountLabel = '';
  constructor(private logger: LogService,
               private walletService: WalletService,
               private activatedRoute: ActivatedRoute,
               private social: SocialSharing,
               // private marketService: MarketService,
               private appflow: AppflowService,
               private alertCtrl: AlertController,
               private casinocoinService: CasinocoinService,
                private loading: LoadingController,
               private sessionStorageService: SessionStorageService,
               private localStorageService: LocalStorageService,
               private currencyPipe: CurrencyPipe,
               private translate: TranslateService,
              public actionSheetController: ActionSheetController,
              public modal: ModalController,
              private clipboard: Clipboard,
               private cscAmountPipe: CSCAmountPipe
             ) {
               this.numberOfTokenAccounts = new Array(1).fill(0);

             }

    ngOnInit() {
      this.logger.debug('### WalletPage onInit');
      this.isLoading = true;
          this.tokenlist = this.casinocoinService.tokenlist;
          // subscribe to updates
          this.casinocoinService.tokenlistSubject.subscribe( tokenlist => {
            this.tokenlist = tokenlist;
            this.isLoading = false;
          });
          this.appflow.cscaccounts.subscribe(
            cscAccounts => {
              this.cscAccounts = cscAccounts;

            });
            this.translate.get(["PAGES.WALLET.ERROR-TITLE",
                                "PAGES.WALLET.ERROR-MSG",
                                "PAGES.WALLET.ERROR-OK",
                                "PAGES.WALLET.ERROR-ACT-ACC-TOKEN",
                                "PAGES.WALLET.PIN-ACT-TOKEN",
                                "PAGES.WALLET.ADDING-ACCOUNT",
                                "PAGES.WALLET.ERROR-ADD-ACT"]).subscribe( (res: string[]) => {
                                  this.errorMessageList = res;
                                  this.logger.debug("### Wallet Page ::: error message list strings :" + JSON.stringify(this.errorMessageList));
                                });
    }
  async presentActionSheet() {
      await this.translate.get(["PAGES.WALLET.SHOW-ADD-ACCOUNT",
                          "PAGES.WALLET.SHOW-ADD-TOKEN",
                          "PAGES.WALLET.SHOW-LEDGERS"]).subscribe( async (res: string) => {
              const actionSheet = await this.actionSheetController.create({
                header: 'Add',
                buttons: [{
                  text: res['PAGES.WALLET.SHOW-ADD-ACCOUNT'],
                  role: 'destructive',
                  icon: 'add-circle-outline',
                  handler: () => {
                    this.addCSCAccount();
                  }
                }, {
                  text: res['PAGES.WALLET.SHOW-ADD-TOKEN'],
                  icon: 'add-circle',
                  handler: () => {
                    this.onAddToken();
                  }
                }, {
                  text: res['PAGES.WALLET.SHOW-LEDGERS'],
                  icon: 'add',
                  handler: () => {

                  }
                }]
              });
              await actionSheet.present();
      });
    }

    doAddToken() {
      // this.logger.debug('### Wallet Page: Add Token: ' + this.addToken.Token + ' for: ' + this.selectedCSCAccount);
      // const walletObject: WalletDefinition = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
      // if (this.walletService.checkWalletPasswordHash(this.walletPassword, walletObject.walletUUID, walletObject.passwordHash)) {
      //   this.addIcon = 'pi fa-spin pi-spinner';
      //   this.addTokenToAccount(this.addToken, this.walletPassword, this.selectedCSCAccount);
      // } else {
      //   this.footer_visible = true;
      //   this.error_message = 'You entered the wrong wallet password!';
      //   this.addIcon = 'fa fa-plus';
      //   this.renderer.selectRootElement('#float-input-password').value = '';
      //   this.renderer.selectRootElement('#float-input-password').focus();
      // }
    }

    copyAccountID(text){
      this.clipboard.copy(text);
      this.copyIcon = 'checkmark';
      const finishTimer = timer(1000);
      finishTimer.subscribe(val =>  {
        this.copyIcon = 'copy';
      });
    }

    filterFunction(token){
      if(token.Token == this.filterToken.toUpperCase() || this.filterToken.toUpperCase() == 'ALL'){
        return true;

      }else{
        return false;
      }
    }

    async onAddToken(accountID?:string){
        var params = {};
        if(accountID){
          console.log("account: ",accountID);
          let selectedAccount = this.walletService.getAccount('CSC', accountID);
          params = {
            cscAccounts:this.cscAccounts,
            availableTokenlist:this.availableTokenlist,
            selectedCSCAccount:selectedAccount
          };
        }else{
          params = {
            cscAccounts:this.cscAccounts,
            availableTokenlist:this.availableTokenlist
          };
        }
        console.log("cscAccounts: ",this.cscAccounts);
        console.log("tokens: ",this.availableTokenlist);
        if(this.cscAccounts.length == 0){
          console.log("ERROR NO ACCOUNTS ACTIVE: ",this.availableTokenlist);
          this.logger.debug("#### wallet: There are not active account for adding a token");
          let alert = await this.alertCtrl.create({
            header: this.errorMessageList['PAGES.WALLET.ERROR-TITLE'],
            subHeader: this.errorMessageList['PAGES.WALLET.ERROR-MSG'],
            message: this.errorMessageList['PAGES.WALLET.ERROR-ACT-ACC-TOKEN'],
            buttons: this.errorMessageList['PAGES.WALLET.ERROR-OK']
          });
          await alert.present();

          return await alert.onDidDismiss().then(() => {
            return false;
            // setTimeout(() => {
            //   this.pinCodeViewChild.setFocus();
            // }, 200);
          });

        }
        this.modal
        .create({
          component: AddTokenComponent,
          componentProps:params
        }).then(
          addTokenModal => {
            addTokenModal.present();
            return addTokenModal.onDidDismiss();
          }).then(
            async resultData => {
              if(resultData.role === "addToken"){
                const result = await this.appflow.onValidateTx("addToken", this.errorMessageList['PAGES.WALLET.PIN-ACT-TOKEN'], this.theme);
                if(result.data.state){
                  this.addTokenToAccount(resultData.data.token,resultData.data.account, result.data.password);
                }
              }
            });
    }

        async addCSCAccount(){
          this.logger.debug('### WalletPage: add CSC account');

            const msg = this.errorMessageList['PAGES.WALLET.ADDING-ACCOUNT'];
            // creating loader into a callback to pass to onValidateTx function so the loader pops at the right time!
            const callbackNOW = (data) => {

              let result = data;
              this.logger.debug('### WalletPage:  result is: '+JSON.stringify(result));
              if(result.data && result.data.state){
                    this.loading
                    .create({
                      keyboardClose:true,
                      message:msg
                    })
                    .then( loading => {

                    loading.present().then(() => {

                      let password = result.data.password;
                      this.logger.debug('### WalletPage: password OK adding account');
                      // add account to wallet
                      this.walletService.addCSCAccount(password);
                      // subscribe to account updates
                      this.casinocoinService.subscribeAccountEvents();
                      // refresh tokenlist
                      this.casinocoinService.refreshAccountTokenList();
                      this.loading.dismiss();
                    });
                  });//end of loading
                }else{
                  this.logger.debug('### WalletPage: password WRONG not adding account result is: '+JSON.stringify(result));
                  let alert = this.alertCtrl.create({
                    header: this.errorMessageList['PAGES.WALLET.ERROR-TITLE'],
                    subHeader: this.errorMessageList['PAGES.WALLET.ERROR-MSG'],
                    message: this.errorMessageList['PAGES.WALLET.ERROR-ADD-ACT'],
                    buttons: this.errorMessageList['PAGES.WALLET.ERROR-OK'],
                  }).then( alert =>{
                    alert.present();

                  });
                }
                return data;
            }
            const final = await this.appflow.onValidateTx("addCSCAccount",this.errorMessageList['PAGES.WALLET.PIN-ADD-ACCT'],this.theme, callbackNOW);
            this.logger.debug('### WalletPage: add CSC account RESULT::::: '+JSON.stringify(final));






  }

  ionViewWillEnter(){
    this.theme = this.appflow.dark ? "dark":"light";
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('toAccount')){
        //redirect
      }else{
        const accountID = paramMap.get('toAccount');

        this.onAddToken(accountID);
      }
      if(!paramMap.has('filterToken')){
        this.filterToken = 'ALL';
        this.logger.debug('### WalletPage: ionViewWillEnter ::::: not found any filter. Applying ALL ');


      }else{
        this.filterToken = paramMap.get('filterToken');
        this.logger.debug('### WalletPage: ionViewWillEnter ::::: found filter:'+ this.filterToken);


      }
      const newTokenList = [];
      this.casinocoinService.tokenlist.forEach(token => {
        if(this.filterFunction(token)){
          newTokenList.push(token);
        }
      });
      this.tokenlist = newTokenList;
      if(!paramMap.has('result')){
        this.txResult = paramMap.get('filterToken');
        this.logger.debug('### WalletPage: ionViewWillEnter ::::: filterFunction result:'+ this.txResult);

      }
      this.isLoading = false;
   });
 }


  addTokenToAccount(token, accountID, password) {
    this.appflow.addTokenToAccount(token,accountID,password);
  }
  shareAccountID(token){
     this.logger.debug("### Share: " + token.AccountID +" and token: "+token.Token  );
     // this.social.share("CasinoCoin "+token.Token+" AccountID: " + token.AccountID, "CasinoCoin Account");
     this.translate.get('PAGES.WALLET.SHARE-MSG', {token: token.Token, accountID:token.AccountID}).subscribe(res => {
          this.logger.debug("### Wallet Page ::: Resulting share string : " + res  );
          this.social.share(res);
      });
  }



}
