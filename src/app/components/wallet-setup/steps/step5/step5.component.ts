import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { LogService } from '../../../../providers/log.service';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../../providers/wallet.service';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../../../../domains/app-constants';
import { IonSlides } from '@ionic/angular';
import { WalletSetupModalComponent } from '../../helpers/wallet-setup-modal/wallet-setup-modal.component'
import { WalletSetupAlertComponent } from '../../helpers/wallet-setup-alert/wallet-setup-alert.component'

@Component({
  selector: 'wallet-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss'],
})
export class Step5Component implements OnInit {
  odds: string[] = [];
  evens: string[] = [];
  userEmail: string = "";
  modalPopUp: string = "Hola";
  @Input() slider: IonSlides;
  @HostListener('window:ionSlideTransitionEnd') slideChanged() {
      this.slider.getActiveIndex().then(
     (index)=>{
       if(index == 4){
          this.onDisplay();
       }
      });
  }
    constructor(
      private modal: ModalController,
      private translate: TranslateService,
      private alert: AlertController,
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
      this.logger.debug('### loaded email '+ this.userEmail);
      this.translate.get('PAGES.SETUP.STEP5-SUBTITLE').subscribe((res: string) => {
        this.alert.create({
        header: 'Alert',
        subHeader: 'Subtitle',
        message: res,
        buttons: ['I understand']
      }).then( alert =>  {
          alert.present();
        });
      });


    }

    swipeNext(){
      this.alert.create({
      header: 'Alert',
      subHeader: 'Subtitle',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Go back',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'I already made a copy',
          handler: () => {
            this.logger.debug('### Go to step 6 triggered');
            this.slider.lockSwipes(false);
            this.slider.slideNext();
            this.slider.lockSwipes(true);
            console.log('Confirm Ok');
          }
        }
      ]
    }).then( alert =>  {
        alert.present();
      });

    }


}
