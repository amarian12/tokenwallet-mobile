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
                    this.onAddToken('1');
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

    async onAddToken(accountID){
        var accountsAval = [];
        if(accountID !== "1" ){
          accountsAval = [{ label:"provided Account", value:accountID}];
        }else{
          accountsAval = this.cscAccounts;
        }
        console.log("cscAccounts: ",this.cscAccounts);
        console.log("tokens: ",this.availableTokenlist);
        if(accountsAval.length == 0){
          console.log("ERROR NO ACCOUNTS ACTIVE: ",this.availableTokenlist);
          this.logger.debug("#### wallet: There are not active account for adding a token");
          let alert = await this.alertCtrl.create({
            header: 'ERROR',
            subHeader: "You don't have any active account for adding a token.",
            buttons: ['OK']
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
          componentProps: {
            cscAccounts:accountsAval,
            availableTokenlist:this.availableTokenlist
          }
        }).then(
          addTokenModal => {
            addTokenModal.present();
            return addTokenModal.onDidDismiss();
          }).then(
            async resultData => {
              if(resultData.role === "addToken"){
                const result = await this.appflow.onValidateTx("addToken", "Enter your PIN to add selected token to Account", this.theme);
                if(result.data.state){
                  this.addTokenToAccount(resultData.data.token,resultData.data.account, result.data.password);
                }
              }
            });
    }

        async addCSCAccount(){
          this.logger.debug('### WalletPage: add CSC account');

            const msg = "Adding CSC account to Wallet";
            const result = await this.appflow.onValidateTx("addCSCAccount","Enter your PIN to add a new CSC Account",this.theme, undefined);
            this.logger.debug('### WalletPage: add CSC account RESULT::::: '+JSON.stringify(result));
            if(result && result.data.state){

              this.loading
              .create({
                keyboardClose:true,
                message:msg
              })
              .then( async loading => {

              loading.present();
              const password = result.data.password;
              this.walletPassword = password;
              this.logger.debug('### WalletPage: password OK adding account');
              // add account to wallet
              this.walletService.addCSCAccount(password);
              // subscribe to account updates
              this.casinocoinService.subscribeAccountEvents();
              // refresh tokenlist
              this.casinocoinService.refreshAccountTokenList();
        });//end of loading

      }else{
        this.logger.debug('### WalletPage: password WRONG not adding account');
      }
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
        console.log("@@@@@@@@@@@@@@@@@@@@    THIS IS NOT FOUND FILTER:::::: ", this.filterToken);


      }else{
        this.filterToken = paramMap.get('filterToken');
        console.log("@@@@@@@@@@@@@@@@@@@@    THIS IS FOUND FILTER:::::: ", this.filterToken);

      }
      const newTokenList = [];
      this.tokenlist.forEach(token => {
        if(this.filterFunction(token)){
          newTokenList.push(token);
        }
      });
      this.tokenlist = newTokenList;
      if(!paramMap.has('result')){
        this.txResult = paramMap.get('filterToken');
        console.log("@@@@@@@@@@@@@@@@@@@@    RESULT ", this.txResult);
      }
      this.isLoading = false;
   });
 }


  addTokenToAccount(token, accountID, password) {
    this.appflow.addTokenToAccount(token,accountID,password);
  }



}
