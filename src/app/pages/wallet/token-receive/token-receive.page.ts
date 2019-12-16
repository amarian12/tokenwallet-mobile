import { Component, OnInit } from '@angular/core';
import { CSCUtil } from '../../../domains/csc-util';
import { ActivatedRoute } from '@angular/router';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { TokenType } from '../../../domains/csc-types';
import { LogService } from '../../../providers/log.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-token-receive',
  templateUrl: './token-receive.page.html',
  styleUrls: ['./token-receive.page.scss'],
})
export class TokenReceivePage implements OnInit {
  tokenAccountLoaded: TokenType;
  public cscReceiveURI: string = null;
  accountID: string;
  sendAmount: string;
  destinationTag: number;
  label: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private social: SocialSharing,
    private casinocoinService: CasinocoinService,
    private logger: LogService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.logger.debug('### Receive CSC ###');
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('tokenId')){
        //redirect
        return;
      }else{
        const tokenId = paramMap.get('tokenId');
        this.logger.debug("Token Receive Page: getting token account object: "+tokenId);
        this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
        this.logger.debug("Token Receive Page: getting token account object right away: "+JSON.stringify(this.tokenAccountLoaded));
        // get account id
        if(this.tokenAccountLoaded){
          this.accountID = this.tokenAccountLoaded.AccountID;
          this.updateQRCode();
        }else{

          this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
            if (finished) {
              this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
              this.logger.debug("Token receive Page: getting token account object after refresh: "+JSON.stringify(this.tokenAccountLoaded));
              // get account id
              this.accountID = this.tokenAccountLoaded.AccountID;
              // this.cscReceiveURI = CSCUtil.generateCSCQRCodeURI({ address: this.accountID });
              this.updateQRCode();

            }
          });

        }
        // this.cscReceiveURI = CSCUtil.generateCSCQRCodeURI({ address: this.accountID });




      }
    });
  }
  shareAccountID(){
     this.logger.debug("### Share: " + this.tokenAccountLoaded.AccountID +" and token: "+this.tokenAccountLoaded.Token  );
     this.social.share("CasinoCoin "+this.tokenAccountLoaded.Token+" AccountID: " + this.tokenAccountLoaded.AccountID, "CasinoCoin BRM Account");
  }

  updateQRCode() {
    const uriObject = {
      address: this.tokenAccountLoaded.AccountID,
      token: this.tokenAccountLoaded.Token
    };
    if (this.sendAmount && this.sendAmount.length > 0) {
      uriObject['amount'] = this.sendAmount;
    }
    if (this.destinationTag && (this.destinationTag > 0 && this.destinationTag < 2147483647)) {
      uriObject['destinationTag'] = this.destinationTag;
    }
    if (this.label && this.label.length > 0) {
      uriObject['label'] = this.label;
    }
    this.cscReceiveURI = CSCUtil.generateCSCQRCodeURI(uriObject);
  }

}
