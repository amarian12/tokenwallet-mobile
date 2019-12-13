import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CSCURI } from '../../../domains/csc-types';
import { CSCUtil } from '../../../domains/csc-util';
import { LokiAddress } from '../../../domains/lokijs';
import { LogService } from '../../../providers/log.service';
import { AppflowService } from '../../../providers/appflow.service';
import { WalletService } from '../../../providers/wallet.service';


@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {

  contact: LokiAddress = {
    accountID: "",
    destinationTag: 0,
    notes: "",
    label: "",
    owner: false
  };

  action = "";
  contactName = "";


  constructor(
      private appflow: AppflowService,
      private logger: LogService,
      private walletService: WalletService,
      private activeRoute: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit() {
    this.activeRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('action')){
        this.action = "";
        return;
      }else{
          this.action = paramMap.get('action');
          if(this.action == "scan"){
            this.scanQRCode();
          }
      }
    });
  }
  async scanQRCode(){
    let data = await this.appflow.scanQRCode();
    this.logger.debug("#### DATA ON QR::: "+JSON.stringify(data));
    this.contact.accountID = data.address;
    if(data.label){
      this.contact.label = data.label;
    }
    if(data.destinationTag){
      this.contact.destinationTag = data.destinationTag;
    }


  }
  resetContact(){
    this.contact = {
      accountID: "",
      destinationTag: 0,
      notes: "",
      label: "",
      owner: false
    };
  }
  onCancel(){
    this.resetContact();
    this.router.navigate(['./tabs/contacts'], { relativeTo: this.activeRoute.parent });
  }
  addContact() {
    // create addressbook entry
    if(this.contact.accountID == ""){
      this.logger.debug("Account ID must be entered.");
      return false;
    }
    if(this.contact.label == ""){
      this.logger.debug("You must enter a name for the contact");
      return false;
    }
    try {
      //add address in lokijs
      console.log(this.walletService.isWalletOpen);
      this.walletService.addAddress(this.contact);
      this.router.navigate(['./tabs/contacts'], { relativeTo: this.activeRoute.parent });
    } catch (error) {
      this.logger.debug("Account ID Already added in Contacts or..."+error);
      return;
    }

  }
}
