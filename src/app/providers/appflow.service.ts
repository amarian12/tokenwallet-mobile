import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, take, filter, map } from 'rxjs/operators';
import { CSCAmountPipe } from '../domains/csc.pipes';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { AppConstants } from '../domains/app-constants';
import { CasinocoinService } from './casinocoin.service';
import { WalletService } from './wallet.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LedgerStreamMessages, TokenType, Payment, WalletDefinition } from '../domains/csc-types';
import Big from 'big.js';

@Injectable({
  providedIn: 'root'
})
export class AppflowService {
  private _tokenlist = new BehaviorSubject<TokenType[]>([]);
  private _cscaccounts = new BehaviorSubject<any[]>([]);
  private _transctionParams = new BehaviorSubject<any>({});
  private _transctionList = new BehaviorSubject<any>({});
  private _walletBalances = new BehaviorSubject<any[]>([]);
  // private tokenlist:Array<TokenType>;
  columnCount: number;
  isLoading: boolean;
  ledgers: LedgerStreamMessages[] = [];
  receipient: string;
  description: string;
  amount: string;
  fees: string;
  accountReserve: string;
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

  userName: string;
  mainCSCAccountID: string;
  availableTokenlist: Array<TokenType> = [];
  addToken: TokenType;
  addIcon = 'fa fa-plus';
  footer_visible = false;
  error_message: string;
  // cscAccounts: Array<any> = [];
  selectedCSCAccount: string;
  addTokenAccountSelected: boolean;
  showErrorDialog = false;

  public cscReceiveURI: string = null;
  showReceiveQRCodeDialog = false;
  sendAmount: string;
  destinationTag: number;
  label: string;
  copyIcon = 'fa fa-copy';

  showSecretDialog = false;
  showSecret = false;
  accountSecret: string;
  // numberOfTokenAccounts: Array<number> =[0];
  numberOfTokenAccounts: Array<number>;

  showEditAccountLabel = false;
  accountLabel = '';

  constructor(
    private logger: LogService,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
    private casinocoinService: CasinocoinService,
    private walletService: WalletService,
    private cscAmountPipe: CSCAmountPipe

  ) {
    this.userName = this.localStorageService.get(AppConstants.KEY_BRM_USER);
    this.logger.debug('### Appflow: consturctor() ###');
    this.columnCount = 5;

    // refresh server list
    this.casinocoinService.updateServerList();
    // connect to CasinoCoin network
    this.casinocoinService.connectSubject.subscribe( result => {
      if (result === AppConstants.KEY_CONNECTED) {
        // translation parameters
        // this.translateParams = {accountReserve: this.casinocoinService.serverInfo.reserveBaseCSC};
        // refresh Accounts
        this.logger.debug('### Appflow: Account Refresh');
        this.casinocoinService.refreshAccounts().subscribe(accountRefreshFinished => {
          if (accountRefreshFinished) {
            // refresh Token List
            this.logger.debug('### Appflow: TokenList Refresh');
            this.casinocoinService.refreshAccountTokenList().subscribe(finished => {

              if (finished) {
                this.tokenlist.pipe(take(1)).subscribe(tokenlist => {
                  this._tokenlist.next(this.casinocoinService.tokenlist);


                });


                // this.numberOfTokenAccounts = new Array(this.tokenlist.length).fill(0);
                // this.logger.debug('### Appflow TokenList: ' + JSON.stringify(this.tokenlist));
                // remove password from session if its still there
                this.sessionStorageService.remove(AppConstants.KEY_WALLET_PASSWORD);
              }
            });
            // Check if user password is still in the session
            const userPass = this.sessionStorageService.get(AppConstants.KEY_WALLET_PASSWORD);
            if (userPass != null) {
                this.sessionStorageService.remove(AppConstants.KEY_WALLET_PASSWORD);
            }
          }
        });
        // set fees
        this.transactionParams.pipe(take(1)).subscribe(transactionParams => {
          this._transctionParams.next({
            fees: this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC,
            accountReserve: this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC,
            reserveIncrement: this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC
          });

        });
      }
    });
    this.walletService.openWalletSubject.subscribe( result => {
      if (result === AppConstants.KEY_LOADED) {
        // get the main CSC AccountID
        this.mainCSCAccountID = this.walletService.getMainAccount().accountID;
        // get all CSC accounts for add token dropdown
        this.walletService.getAllAccounts().forEach( element => {
          if (element.currency === 'CSC' && new Big(element.balance) > 0 && element.accountSequence >= 0) {
             const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                this.cscAmountPipe.transform(element.balance, false, true) + ']';
            this.cscaccounts.pipe(take(1)).subscribe(cscaccounts => {
              this._cscaccounts.next(cscaccounts.concat({label: accountLabel, value: element.accountID}));

            });
            // this.cscAccounts.push({label: accountLabel, value: element.accountID});
          }
        });
        // subscribe to account updates
        this.casinocoinService.accountSubject.subscribe( account => {
          this.transactionParams.pipe(take(1)).subscribe(transactionParams => {
            this._transctionParams.next({
              fees: this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC,
              accountReserve: this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC,
              reserveIncrement: this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC
            });

          });
          // this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
          // this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
          // this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;
          // refresh all CSC accounts for add token dropdown
          this._cscaccounts.next([]);
          this.walletService.getAllAccounts().forEach( element => {
            if (element.currency === 'CSC' && new Big(element.balance) > 0  && element.accountSequence >= 0) {
               const accountLabel = element.accountID.substring(0, 10) + '...' + ' [Balance: ' +
                                  this.cscAmountPipe.transform(element.balance, false, true) + ']';
                this.cscaccounts.pipe(take(1)).subscribe(cscaccounts => {
                  this._cscaccounts.next(cscaccounts.concat({label: accountLabel, value: element.accountID}));

                });
            }
          });
          this.isLoading = false;
        });
      }
    });



   }
   get tokenlist(){
     return this._tokenlist.asObservable()
   }
   getTokenAccount( pkID: string){
     return this.tokenlist.pipe(take(1),map(tokenList => {
        return {...tokenList.find( token => token.PK === pkID)};
     }));
   }
   get cscaccounts(){
     return this._cscaccounts.asObservable()
   }
   getCSCAccount( pkID: string){
     return this.cscaccounts.pipe(take(1),map(cscAccounts => {
        return {...cscAccounts.find( account => account.PK === pkID)};
     }));
   }
   get transactionParams(){
     return this._transctionParams.asObservable()
   }

   get walletBalances(){
     return this._walletBalances.asObservable()
   }
   getFees(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
        return transactionParams.fees;
     }));
   }
   getAccountReserve(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
       return transactionParams.accountReserve;
     }));
   }
   getReserveIncrement(){
     return this.transactionParams.pipe(take(1),map(transactionParams => {
       return transactionParams.reserveIncrement;
     }));

   }
   getTokenConsolidatedBalance(token){
     return this.walletBalances.pipe(take(1),map(walletBalances => {
       this.logger.debug('### Appflow:  finding '+token+' balance'+JSON.stringify(walletBalances));

       return {...walletBalances.find( balance => balance.token === token)}.balance;

     }));

   }
   getAllTokenBalances(){
     return this.walletBalances.pipe(take(1),map(walletBalances => {
       this.logger.debug('### Appflow: finding all balances'+JSON.stringify(walletBalances));

       return walletBalances;

     }));

   }



   updateBalance(tokenlist){
     var tokenArray =[];
     tokenlist.forEach( token => {

       this.logger.debug('### Appflow: We will update general balances');
       if(!tokenArray.includes(token.Token)){
         this.logger.debug('### Appflow: adding balance for token:'+token.Token);
         tokenArray.push(token.Token);
         var balance = this.walletService.getWalletBalance(token.Token) ? this.walletService.getWalletBalance(token.Token) : "0";
         this.logger.debug('### Appflow:  balance reported for token:'+token.Token+" is: "+balance );

         if(parseInt(balance) > 0){
           this.walletBalances.pipe(take(1)).subscribe(walletBalances => {
             this._walletBalances.next(walletBalances.concat({token: token.Token, balance: balance, img: token.IconURL}));
             this.logger.debug('### Appflow:  added to array cause we found balance:'+token.Token+" is: "+balance );


           });
         }

       }else{
         var balance = this.walletService.getWalletBalance(token.Token) ? this.walletService.getWalletBalance(token.Token) : "0";
         if(parseInt(balance) > 0){
           this.walletBalances.pipe(take(1)).subscribe(walletBalances => {
             var i = walletBalances.findIndex( object => object.token === token.Token );
             walletBalances[i].balance = balance;
             this._walletBalances.next(walletBalances);
             this.logger.debug('### Appflow:  updated on array cause we found balance:'+token.Token+" is: "+balance );


           });
         }
       }




     });
   }

}
