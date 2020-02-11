import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
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
  initializedStep:boolean;

  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 1){
         this.zone.run(() => {
           this.initialize();
         });
       }
      });
  }
  @Input() slider: IonSlides;
    constructor(
      private zone: NgZone,
      private logger: LogService
    ) {
      this.initializedStep = false;

    }


    ngOnInit(){}

    initialize() {
      this.logger.debug('### Ready second step. Wallet Setup ');
      // Ugly hack to hide the disclaimer textarea hidden so it won't show on old devices on quirky 3d rendered before it shows here.
      this.initializedStep = true;

    }
    swipeNext(){
      this.logger.debug('### Go to step 3 triggered');
      if(this.disclaimerAccepted){
        this.slider.lockSwipes(false);
        this.slider.slideNext();
        this.initializedStep = false;
        this.slider.lockSwipes(true);
      }else{
        this.logger.debug('### You need to accept the agreement to continue');
        this.initializedStep = true;

      }
    }
    updateDisclaimerAccepted(){
      this.logger.debug('### Changed value of diclaimerAccepted to: '+this.disclaimerAccepted);
    }
}
