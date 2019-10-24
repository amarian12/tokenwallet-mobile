import { Component, OnInit, Input, HostListener } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'wallet-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss'],
})
export class Step5Component implements OnInit {
  odds: string[] = [];
  evens: string[] = [];
  userEmail: string = "";

  @Input() slider: IonSlides;
  @HostListener('ionSlideTransitionEnd') slideChanged() {
    this.logger.debug('### I did it!!');
  }
    constructor(
      private logger: LogService,
      private walletService: WalletService
    ) { }

    ngOnInit() {
      const arr = this.walletService.walletSetup.recoveryMnemonicWords;
      for (var i = 0 ; i < arr.length; i++){
          if(i%2 == 0){
            // take into account that 0 is the 1 element
            // that's why odd and even is swapped
            this.odds[i] = arr[i];
          }else{
            this.evens[i] = arr[i];

          }
      }
      this.odds = this.odds.filter(Boolean);
      this.evens = this.evens.filter(Boolean);

      this.logger.debug('### Ready fifth step. Wallet Setup ');
      this.logger.debug('### odds are ready ');
      console.log(this.odds);
      this.logger.debug('### evens are ready ');
      console.log(this.evens);
    }
    onDisplay() {
      this.userEmail = this.walletService.walletSetup.userEmail;
      this.logger.debug('### asigned email '+ this.userEmail);

    }

    swipeNext(){
      this.logger.debug('### Go to step 6 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideNext();
      this.slider.lockSwipes(true);
    }


}
