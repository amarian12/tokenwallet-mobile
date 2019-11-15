import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CSCURI } from '../../../domains/csc-types';
import { CSCUtil } from '../../../domains/csc-util';
import { LokiAddress } from '../../../domains/lokijs';
import { LogService } from '../../../providers/log.service';
import { WalletService } from '../../../providers/wallet.service';


@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {

  accountID = "";
  contactName = "";


  constructor(
      private logger: LogService,
      private walletService: WalletService,
      private activeRoute: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit() {
  }
  addContact() {
    // create addressbook entry
    let newAddress:LokiAddress = {
      accountID: this.accountID,
      label: this.contactName,
      owner: false
    }
    try {
      //add address in lokijs
      console.log(this.walletService.isWalletOpen);
      this.walletService.addAddress(newAddress);
      this.router.navigate(['./contacts'], { relativeTo: this.activeRoute.parent });
    } catch (error) {
      this.logger.debug("Account ID Already added in Contacts or..."+error);
      return;
    }

  }
}
