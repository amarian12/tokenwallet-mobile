import { Component, OnInit, Input } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';
@Component({
  selector: 'wallet-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss'],
})
export class Step2Component implements OnInit {
  disclaimerAccepted:boolean;

  @Input() slider: IonSlides;
    constructor(private logger: LogService,) { }

    ngOnInit() {
      this.logger.debug('### Ready first step. Wallet Setup ');
    }
    swipeNext(){
      this.logger.debug('### Go to step 3 triggered');
      if(this.disclaimerAccepted){
        this.slider.lockSwipes(false);
        this.slider.slideNext();
        this.slider.lockSwipes(true);
      }else{
        this.logger.debug('### You need to accept the agreement to continue');

      }
    }
    updateDisclaimerAccepted(){
      this.logger.debug('### Changed value of diclaimerAccepted to: '+this.disclaimerAccepted);
    }
}
