import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'wallet-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss'],
})
export class Step3Component implements OnInit {
  userFormIsValid: boolean;
  @Input() slider: IonSlides;
    constructor(
      private logger: LogService,
      private walletService: WalletService
    ) {
      this.userFormIsValid = false;
    }

    ngOnInit() {
      this.logger.debug('### Ready Third step. Wallet Setup ');
    }

    swipeNext(){
      this.logger.debug('### Go to step 4 triggered');
      if(this.userFormIsValid){
        this.slider.lockSwipes(false);
        this.slider.slideNext();
        this.slider.lockSwipes(true);
      }else{
        this.logger.debug('### The User form is not valid. Check your input');
      }
    }
    onSubmit(form: NgForm){
      if(form.form.status === 'VALID'){
        this.userFormIsValid = true;
        this.walletService.walletSetup.userEmail = form.form.value.email;
        this.walletService.walletSetup.userPassword = form.form.value.pincode;
        this.logger.debug('### Wallet setup updated:');
        console.log(this.walletService);
        this.swipeNext();
      }
      this.logger.debug('### The User form content:');
      this.logger.debug(form.form.value);
      this.logger.debug(form.form.status);



    }
}
