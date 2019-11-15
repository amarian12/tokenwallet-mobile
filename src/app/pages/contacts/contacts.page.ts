import { Component, OnInit } from '@angular/core';
import { CSCURI } from '../../domains/csc-types';
import { CSCUtil } from '../../domains/csc-util';
import { LokiAddress, LokiAccount } from '../../domains/lokijs';
import { LogService } from '../../providers/log.service';
import { AppConstants } from '../../domains/app-constants';
import { WalletService } from '../../providers/wallet.service';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  contacts: Array<LokiAddress> = []
  contactsEmpty = true;
  mainCSCAccount:LokiAccount;
  constructor(
    private logger: LogService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
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


    
    // get all contact addresses
    if(this.walletService.isWalletOpen){
      this.logger.debug("### Contacts Open ###");
      this.contacts = this.walletService.getAllAddresses();
      this.logger.debug("### Contacts Found :"+JSON.stringify(this.contacts));
      this.logger.debug("### Contacts length :"+JSON.stringify(this.contacts.length));
      if (this.contacts.length > 0){
        this.contactsEmpty = false;
      }else{
        this.contactsEmpty = true;

      }
    }else{
      this.walletService.openWalletSubject.subscribe( result => {
        if(result == AppConstants.KEY_LOADED){
          this.logger.debug("### Contacts Open ###");
          this.contacts = this.walletService.getAllAddresses();
          this.logger.debug("### Contacts Found :"+JSON.stringify(this.contacts));
          this.logger.debug("### Contacts length :"+JSON.stringify(this.contacts.length));
          if (this.contacts.length > 0){
            this.contactsEmpty = false;
          }else{
            this.contactsEmpty = true;

          }
        }
      });

    }

  }


}
