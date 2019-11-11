import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { TokenType } from '../../../domains/csc-types';
import { LogService } from '../../../providers/log.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private casinocoinService: CasinocoinService,
    private logger: LogService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('tokenId')){
        //redirect
        return;
      }else{
        const tokenId = paramMap.get('tokenId');
        this.logger.debug("Token Detail Page: getting token account object: "+tokenId);
        this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
        this.logger.debug("Token Detail Page: getting token account object right away: "+JSON.stringify(this.tokenAccountLoaded));
        if(this.casinocoinService.serverInfo){
          this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
          this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
          this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;

        }
        if(!this.tokenAccountLoaded){

          this.casinocoinService.refreshAccountTokenList().subscribe(finished => {
            if (finished) {
              this.tokenAccountLoaded = this.casinocoinService.getTokenAccount(tokenId);
              this.logger.debug("Token Detail Page: getting token account object after refresh: "+JSON.stringify(this.tokenAccountLoaded));
              this.fees = this.casinocoinService.serverInfo.validatedLedger.baseFeeCSC;
              this.accountReserve = this.casinocoinService.serverInfo.validatedLedger.reserveBaseCSC;
              this.reserveIncrement = this.casinocoinService.serverInfo.validatedLedger.reserveIncrementCSC;

            }
          });
        }

      }


    });

  }
  getTotalReserved(tokenObject) {
    return Number(this.accountReserve) + (Number(tokenObject.OwnerCount) *  Number(this.reserveIncrement));
  }

}
