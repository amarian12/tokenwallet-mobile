import { Component, OnInit, Input, HostListener } from '@angular/core';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';



@Component({
  selector: 'wallet-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})

export class Step1Component implements OnInit {
  @HostListener('window:ionSlidesDidLoad') slideChanged() {

      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 0){
          this.initialize();
       }
      });
  }
@Input() slider: IonSlides;
  constructor(private logger: LogService,) { }

  ngOnInit() {

  }
  swipeNext(){
    this.logger.debug('### Go to step 2 triggered');
    this.slider.lockSwipes(false);
    this.slider.slideNext();
    this.slider.lockSwipes(true);
  }
  initialize(){
    this.logger.debug('### Ready first step. Wallet Setup ');
  }
}
