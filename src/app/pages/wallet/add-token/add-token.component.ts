import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { LogService } from '../../../providers/log.service';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../providers/wallet.service';
import { LokiAccount } from '../../../domains/lokijs';
import { TokenType } from '../../../domains/csc-types';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.scss'],
})
export class AddTokenComponent implements OnInit {
  @Input() tokenlist: Array<TokenType>;
  @Input() cscAccounts: Array<any>;
  availableTokenlist: Array<TokenType> = [];
  addTokenAccountSelected: boolean ;
  selectedCSCAccountID: string;
  selectedCSCAccount: LokiAccount;
  selectedToken:TokenType;


  constructor(
    private casinocoinService: CasinocoinService,
    private logger: LogService,
    private alert: AlertController,
    private translate: TranslateService,
    private walletService: WalletService,
    private modal: ModalController,
    private router: Router
  ) { }

  ngOnInit() {}

  getCSCAccountInfo() {
    this.logger.debug('### getCSCAccountInfo: ' + this.selectedCSCAccount);
    this.casinocoinService.refreshAvailableTokenList().subscribe( availableFinished => {
      if (availableFinished) {
        this.availableTokenlist = [];
        // add all tokens to initial list
        this.casinocoinService.availableTokenList.forEach( token => {
          // only add tokens not yet in our wallet for selected account
          const accountsForTokens: Array<LokiAccount> = this.walletService.getAllTokenAccountsByAccountID(this.selectedCSCAccountID);
          if (accountsForTokens.findIndex( item => item.currency === token.Token ) === -1) {
            this.availableTokenlist.push(token);
              this.logger.debug('### Add-token: tokens available' + JSON.stringify(this.availableTokenlist));
          }
        });
        this.addTokenAccountSelected = true;
      }
    });
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
  onAddToken(form:NgForm){
    console.log(form);
    // const errorName = {
    //   header:this.errorMessageList['HEADER'],
    //   subheader:this.errorMessageList['SUBHEADER'],
    //   message:this.errorMessageList['MSGNAMEREQUIRED'],
    //   okbtn:this.errorMessageList['OK']
    // }
    if(!this.selectedCSCAccount){
      const errorNoAcct = {
        header:"Error",
        subheader:"Incomplete information",
        message:"You must select an activated Account to add a token",
        okbtn:"Ok"
      }
      this.displayError(errorNoAcct);
      return false;
    }
    if(!this.selectedToken){
      const errorNoToken = {
        header:"Error",
        subheader:"Incomplete information",
        message:"To add a Token you must select a token from the list",
        okbtn:"Ok"
      }
      this.displayError(errorNoToken);
      return false;
    }
    this.logger.debug('### Add-token: Acct Selected: ' + this.selectedCSCAccount +' token selected: '+ this.selectedToken.Token);
     this.modal.dismiss(form.form.value, "addToken");
  }
  onCancelAddToken(){
    this.modal.dismiss(null, "cancel");
    this.router.navigate(['/tabs/wallet'], { replaceUrl: true });
  }

}
