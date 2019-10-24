import { Component, OnInit, Input } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'wallet-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss'],
})
export class Step4Component implements OnInit {
  developerOptionShow: boolean = false;
  @Input() slider: IonSlides;
    constructor(
      private logger: LogService,
      private walletService: WalletService,
    ) { }

    ngOnInit() {
      this.logger.debug('### Ready fourth step. Wallet Setup ');
    }
    swipeNext(){
      this.logger.debug('### Go to step 5 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideNext();
      this.slider.lockSwipes(true);
    }
    toggleDev(){
      this.developerOptionShow = !this.developerOptionShow;
    }
    onNetworkChanged(event) {
      console.log(event.detail.checked);
      this.logger.debug('### Step 3.1 - Test Network?: ' + event.detail.checked);
      this.walletService.walletSetup.testNetwork = event.detail.checked;
    }
}
