import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LogService } from '../../../../providers/log.service';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'wallet-step6',
  templateUrl: './step6.component.html',
  styleUrls: ['./step6.component.scss'],
})
export class Step6Component implements OnInit {

  public word1: number;
  public word2: number;
  public word3: number;
  public checkWord1 = '';
  public checkWord2 = '';
  public checkWord3 = '';

  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{

       if(index == 5){
          this.zone.run(()=>{
            this.initialize()
          });
       }
      });
  }
  @Input() slider: IonSlides;
    constructor(
      private logger: LogService,
      private zone: NgZone,
      private walletService: WalletService
    ) { }

    ngOnInit() {


    }
    swipeNext(){
      this.logger.debug('### Go to step 7 triggered');
      this.slider.lockSwipes(false);
      this.slider.slideNext();
      this.slider.lockSwipes(true);
    }
    getMnemonic(key:number){
      if(this.walletService.walletSetup.recoveryMnemonicWords){
        return this.walletService.walletSetup.recoveryMnemonicWords[key - 1]
      }else{
        return null;
      }

    }
    onSubmit(form: NgForm){
      const fStatus = form.form.status;
      this.logger.debug('### Setup -> Check mnemonic words entered: ' + this.checkWord1 + ' ' + this.checkWord2 + ' ' + this.checkWord3);
      if(fStatus === "VALID"){
        this.logger.debug('### Mnemonics form is valid!!');
        this.swipeNext();
      }else{
        this.logger.debug('### Mnemonics form validation error !!');
        console.log(form);
      }



    }
    initialize(){
      this.logger.debug('### Ready sixth step. Wallet Setup ');
      this.logger.debug('### Setup -> Check mnemonic words ###');
      // generate 3 random picks from the 12 words
      this.word1 = Math.floor(Math.random() * 12) + 1;
      this.word2 = Math.floor(Math.random() * 12) + 1;
      while (this.word1 === this.word2) {
        this.word2 = Math.floor(Math.random() * 12) + 1;
      }
      this.word3 = Math.floor(Math.random() * 12) + 1;
      while (this.word1 === this.word3 || this.word2 === this.word3) {
        this.word3 = Math.floor(Math.random() * 12) + 1;
      }
      this.logger.debug('### Setup -> Check mnemonic words keys: ' + this.word1 + ' ' + this.word2 + ' ' + this.word3);
      this.logger.debug('### Setup -> Check mnemonic words: ' + this.getMnemonic(this.word1) + ' ' + this.getMnemonic(this.word2) + ' ' + this.getMnemonic(this.word3));
    }
    restartSetup(){
      this.logger.debug("### HELLO!!! im trying to start over");
        this.slider.lockSwipes(false);
       this.slider.slideTo(0);
       this.slider.lockSwipes(true);
    }
}
