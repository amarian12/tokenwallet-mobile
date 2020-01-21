import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CSCUtil } from '../../domains/csc-util';
import { LokiAddress, LokiAccount } from '../../domains/lokijs';
import { LogService } from '../../providers/log.service';
import { AppflowService } from '../../providers/appflow.service';
import { AppConstants } from '../../domains/app-constants';
import { WalletService } from '../../providers/wallet.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  contacts: Array<LokiAddress> = []
  contactsEmpty = true;
  errorMessageList: string[];
  copyIcon = 'copy';
  mainCSCAccount:LokiAccount;
  constructor(
    private logger: LogService,
    private walletService: WalletService,
    private translate: TranslateService,
    private appflow: AppflowService,
    private clipboard: Clipboard,
    private alert: AlertController
  ) { }

  ngOnInit() {
    this.appflow.contacts.subscribe(
      contacts => {
        this.logger.debug('### Contacts. Contacts found through subject: '+ JSON.stringify(contacts));
        this.contacts = contacts || [];
        if (!this.contacts || this.contacts.length <= 0){
           this.logger.debug("### Contacts length :"+JSON.stringify(this.contacts.length));
            this.contactsEmpty = true;
          }else{
            this.contactsEmpty = false;

          }

    });
    this.translate.get('PAGES.CONTACTS.DELETE-CONTACT').subscribe((res: string[]) => {
        this.errorMessageList = res;
        this.logger.debug('### Errors list: ' + JSON.stringify(this.errorMessageList));
    });
    if(this.walletService.isWalletOpen){
      this.mainCSCAccount = this.walletService.getMainAccount();
      this.logger.debug("### Main account Found :"+JSON.stringify(this.mainCSCAccount));
    }else{
      this.walletService.openWalletSubject.subscribe( result => {
        if(result == AppConstants.KEY_LOADED){
          this.mainCSCAccount = this.walletService.getMainAccount();
          this.logger.debug("### Main account Found :"+JSON.stringify(this.mainCSCAccount));
        }

      });

    }

  }
  ionViewWillEnter(){



    // // get all contact addresses
    // if(this.walletService.isWalletOpen){
    //   this.logger.debug("### Contacts Open ###");
    //   this.contacts = this.walletService.getAllAddresses(); // TODO: move this to a subject on appflow
    //   this.logger.debug("### Contacts Found :"+JSON.stringify(this.contacts));
    //   if (!this.contacts || this.contacts.length <= 0){
    //     // this.logger.debug("### Contacts length :"+JSON.stringify(this.contacts.length));
    //     this.contactsEmpty = true;
    //   }else{
    //     this.contactsEmpty = false;
    //
    //   }
    // }else{
    //   this.walletService.openWalletSubject.subscribe( result => {
    //     if(result == AppConstants.KEY_LOADED){
    //       this.logger.debug("### Contacts Open ###");
    //       this.contacts = this.walletService.getAllAddresses();
    //       this.logger.debug("### Contacts Found :"+JSON.stringify(this.contacts));
    //       this.logger.debug("### Contacts length :"+JSON.stringify(this.contacts.length));
    //       if (this.contacts.length > 0){
    //         this.contactsEmpty = false;
    //       }else{
    //         this.contactsEmpty = true;
    //
    //       }
    //     }
    //   });
    //
    // }

  }

  copyAccountID(text){
    this.clipboard.copy(text);
    this.copyIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyIcon = 'copy';
    });
  }
  addDesttag(contact:any):string {
    if(contact.destinationTag && contact.destinationTag > 0){
      this.logger.debug("### Contacts Page: Destination tag Found :"+JSON.stringify(contact));

      return "/"+contact.destinationTag;

    }else{
      this.logger.debug("### Contacts Page: Destination tag not Found :"+JSON.stringify(contact));
      return "";
    }
  }
  onDeleteContact(accountID){
    this.alert.create({
    header: this.errorMessageList['HEADER'],
    subHeader: this.errorMessageList['SUBHEADER'],
    message: this.errorMessageList['MSG'],
    buttons: [
      {
        text: this.errorMessageList['CANCELBTN'],
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          this.logger.debug('### Cancel Deletion!!');
        }
      }, {
        text: this.errorMessageList['DELETEBTN'],
        handler: () => {
          this.appflow.deleteContact(accountID);
          this.logger.debug('### Contact '+accountID+' Deleted!!');
        }
      }
    ]
  }).then( alert =>  {
      alert.present();
    });
  }

}
