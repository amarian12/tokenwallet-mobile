import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CSCURI } from '../../../domains/csc-types';
import { CSCUtil } from '../../../domains/csc-util';
import { LokiAddress } from '../../../domains/lokijs';
import { LogService } from '../../../providers/log.service';
import { AppflowService } from '../../../providers/appflow.service';
import { WalletService } from '../../../providers/wallet.service';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { TranslateService } from '@ngx-translate/core';


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
  editMode = false;
  contactName = "";
  errorMessageList: string[];


  constructor(
      private appflow: AppflowService,
      private logger: LogService,
      private walletService: WalletService,
      private casinocoinService: CasinocoinService,
      private alert: AlertController,
      private translate: TranslateService,
      private activeRoute: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit() {
    this.translate.get('PAGES.CONTACTS.ADD-CONTACTS-ERRORS').subscribe((res: string[]) => {
        this.errorMessageList = res;
        this.logger.debug('### Errors list: ' + JSON.stringify(this.errorMessageList));
    });
    this.activeRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('action')){
        this.action = "";
      }else{
          this.action = paramMap.get('action');
          if(this.action == "scan"){
            this.scanQRCode();
          }
      }
      if(!paramMap.has('loki')){
        this.editMode = false;

      }else{
        this.logger.debug("### Add Contact Page: Edit a contact.");
        this.editMode = true;
        const accountID = paramMap.get('loki');
        this.contact = this.walletService.getAddress(accountID);
        this.logger.debug("### Add Contact Page: will edit contact: "+JSON.stringify(this.contact));
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
  displayError(error){
    this.alert.create({

        header: error.header,
        subHeader: error.subheader,
        message: error.message,
        buttons: [
          {
            text: error.okbtn,
            role: 'ok',
            cssClass: 'secondary',
            handler: () => {
              this.alert.dismiss();
            }
          }
        ]
      }).then( alert =>  {
           return alert.present();
      });
  }
  addContact() {
    // create addressbook entry
    if(this.contact.accountID == ""){
      this.logger.debug("Account ID must be entered.");
      const errorActID = {
        header:this.errorMessageList['HEADER'],
        subheader:this.errorMessageList['SUBHEADER'],
        message:this.errorMessageList['MSGACCTIDREQUIRED'],
        okbtn:this.errorMessageList['OK']
      }
      this.displayError(errorActID);
      return false;
    }
    if(this.contact.label == ""){
      this.logger.debug("You must enter a name for the contact");
      const errorName = {
        header:this.errorMessageList['HEADER'],
        subheader:this.errorMessageList['SUBHEADER'],
        message:this.errorMessageList['MSGNAMEREQUIRED'],
        okbtn:this.errorMessageList['OK']
      }
      this.displayError(errorName);
      return false;
    }
    try {
      //add address in lokijs
      console.log(this.walletService.isWalletOpen);
      if(this.casinocoinService.isValidAccountID(this.contact.accountID)){
        if(this.editMode){
          this.appflow.updateContact(this.contact);
          this.logger.debug("Contact updated Successfully");
        }else{
          this.appflow.addContact(this.contact);
          this.logger.debug("Contact added Successfully");
        }
        this.router.navigate(['./tabs/contacts'], { relativeTo: this.activeRoute.parent });
      }else{
        this.logger.debug("This is not a valid account ID. Please check it and try again");
        const errorInvalid = {
          header:this.errorMessageList['HEADER'],
          subheader:this.errorMessageList['SUBHEADER'],
          message:this.errorMessageList['MSGINVALIDACCTID'],
          okbtn:this.errorMessageList['OK']
        }
        this.displayError(errorInvalid);

      }
    } catch (error) {
      this.logger.debug("Account ID Already added in Contacts or..."+error);
      const errorAlreadyAdded = {
        header:this.errorMessageList['HEADER'],
        subheader:this.errorMessageList['SUBHEADER'],
        message:this.errorMessageList['MSGALREADYADDED'],
        okbtn:this.errorMessageList['OK']
      }
      this.displayError(errorAlreadyAdded);
      return;
    }

  }
}
