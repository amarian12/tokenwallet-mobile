import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
  availableTokenlist: Array<TokenType> = [];
  addTokenAccountSelected: boolean ;
  selectedCSCAccount: string;

  constructor(
    private casinocoinService: CasinocoinService,
    private logger: LogService,
    private translate: TranslateService,
    private walletService: WalletService,
    private modal: ModalController
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
          const accountsForTokens: Array<LokiAccount> = this.walletService.getAllTokenAccountsByAccountID(this.selectedCSCAccount);
          if (accountsForTokens.findIndex( item => item.currency === token.Token ) === -1) {
            this.availableTokenlist.push(token);
              this.logger.debug('### Add-token: tokens available' + JSON.stringify(this.availableTokenlist));
          }
        });
        this.addTokenAccountSelected = true;
      }
    });
  }
  onAddToken(form:NgForm){
    console.log(form);

    this.modal.dismiss(form.form.value, "addToken");
  }
  onCancelAddToken(){
    this.modal.dismiss(null, "cancel");
  }

}
