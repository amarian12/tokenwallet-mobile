import { Component, OnInit, Input, HostListener } from '@angular/core';
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

  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 1){
          this.onDisplay();
       }
      });
  }
  @Input() slider: IonSlides;
    constructor(private logger: LogService,) { }


    ngOnInit(){}

    onDisplay() {
      this.logger.debug('### Ready second step. Wallet Setup ');
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
