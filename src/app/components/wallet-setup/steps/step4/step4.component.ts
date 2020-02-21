import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
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
  initializedStep: boolean;
  developerOptionShow: boolean = false;
  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 3){
         this.zone.run(() => {
           this.initialize();
         });
       }
      });
  }
  @Input() slider: IonSlides;
    constructor(
      private logger: LogService,
      private zone: NgZone,
      private walletService: WalletService
    ) {
      this.initializedStep = false;
     }

    ngOnInit() {
    }
    swipeNext(){
      this.logger.debug('### Go to step 5 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideNext();
      this.initializedStep = false;
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
    initialize(){
      this.logger.debug('### Ready fourth step. Wallet Setup ');

      // Ugly hack to keep the labels on form hidden so they won't show on old devices on quirky 3d rendered before they show here.
      this.initializedStep = true;

    }
}
