import { Component, OnInit, Input, HostListener, NgZone } from '@angular/core';
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
       if(index == 3){
          this.zone.run(()=>{
            this.initialize();
          });
       }
       if(index == 4){
          this.zone.run(()=>{
            this.onDisplay()
          });
       }
      });
  }
    constructor(
      private zone: NgZone,
      private modal: ModalController,
      private translate: TranslateService,
      private alert: AlertController,
      private logger: LogService,
      private walletService: WalletService
    ) { }

    ngOnInit() {

    }
    onDisplay() {
      this.userEmail = this.walletService.walletSetup.userEmail;
      this.logger.debug('### loaded email '+ this.userEmail);
      this.translate.get(['PAGES.SETUP.STEP5-REMINDER-HEADER',
                          'PAGES.SETUP.STEP5-REMINDER-SUBHEADER',
                          'PAGES.SETUP.STEP5-REMINDER-MESSAGE']).subscribe((res: string) => {

        this.alert.create({
        header: res['PAGES.SETUP.STEP5-REMINDER-HEADER'],
        subHeader: res['PAGES.SETUP.STEP5-REMINDER-SUBHEADER'],
        message: res['PAGES.SETUP.STEP5-REMINDER-MESSAGE'],
        buttons: res['PAGES.SETUP.STEP5-REMINDER-BUTTON']
      }).then( alert =>  {
          alert.present();
        });
      });


    }

    swipeNext(){
      this.translate.get(["PAGES.SETUP.STEP5-LASTWARNING-HEADER",
                          "PAGES.SETUP.STEP5-LASTWARNING-SUBHEADER",
                          "PAGES.SETUP.STEP5-LASTWARNING-MESSAGE",
                          "PAGES.SETUP.STEP5-LASTWARNING-BTN-CANCEL",
                          "PAGES.SETUP.STEP5-LASTWARNING-BTN-CONFIRM"]).subscribe((res: string) => {
              this.alert.create({

              header: res['PAGES.SETUP.STEP5-LASTWARNING-HEADER'],
              subHeader: res['PAGES.SETUP.STEP5-LASTWARNING-SUBHEADER'],
              message: res['PAGES.SETUP.STEP5-LASTWARNING-MESSAGE'],
              buttons: [
                {
                  text: res['PAGES.SETUP.STEP5-LASTWARNING-BTN-CANCEL'],
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {

                  }
                }, {
                  text: res['PAGES.SETUP.STEP5-LASTWARNING-BTN-CONFIRM'],
                  handler: () => {
                    this.logger.debug('### Go to step 6 triggered');
                    this.slider.lockSwipes(false);
                    this.slider.slideNext();
                    this.slider.lockSwipes(true);

                  }
                }
              ]
            }).then( alert =>  {
                alert.present();
              });
    });

    }
    initialize(){
      this.odds = [];
      this.evens = [];
      const arr = this.walletService.walletSetup.recoveryMnemonicWords;
      if(arr){
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
      }

      this.logger.debug('### Ready fifth step. Wallet Setup ');
      this.logger.debug('### odds are ready ');
      console.log(this.odds);
      this.logger.debug('### evens are ready ');
      console.log(this.evens);
    }


}
