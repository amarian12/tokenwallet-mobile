import { Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { LogService } from '../../providers/log.service';
import { WalletService } from '../../providers/wallet.service';
// import { CasinoCoin } from '../../providers/wallet.service';
import { AppflowService } from '../../providers/appflow.service';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { TranslateService } from '@ngx-translate/core';
import { CSCCrypto } from '../../domains/csc-crypto';
import { AppConstants } from '../../domains/app-constants';
import { WalletDefinition } from '../../domains/csc-types';
import * as LokiTypes from '../../domains/lokijs';

@Component({
  selector: 'app-change-pin',
  templateUrl: './change-pin.page.html',
  styleUrls: ['./change-pin.page.scss'],
})
export class ChangePinPage implements OnInit {

  oldPIN:string;
  newPIN:string;
  allKeys:LokiTypes.LokiKey[];
  theme:string;
  selectedWallet: WalletDefinition;
  walletEmail: string;

  form = {
    email:"",
    pincode:"",
    pincodeconfirm:""
  };

  constructor(
                private logger: LogService,
                // private route: ActivatedRoute,
                // private router: Router,
                // private platform: Platform,
                // private alert: AlertController,
                private translate: TranslateService,
                private walletService: WalletService,
                // private casinocoinService: CasinocoinService,
                private appflow: AppflowService,
                private location: Location,
                // private loading: LoadingController,
                private localStorageService: LocalStorageService,
                private sessionStorageService: SessionStorageService
              ) { }

  ngOnInit() {}
  ionViewWillEnter(){
    this.validateOLDPIN();
  }
  async validateOLDPIN() {
      this.theme = this.appflow.dark ? "dark":"light";
      const result = await this.appflow.onValidateTx("ChangePin","Enter PIN to authorize PIN modification",this.theme);
      if(result && result.data.state){
        this.oldPIN = result.data.password;
        this.walletEmail = result.data.email;
        this.logger.debug('### Change PIN Page - Current PIN: '+this.oldPIN+" email "+this.walletEmail);

      }else{
        this.location.back();
      }
  }
  filterWord(ctl){
    //(ionChange)="filterWord(wordctl)"
    // this.words[ctl.target.children[0].name] = ctl.detail.value.trim().trim().toLowerCase();
    ctl.target.children[0].value = ctl.detail.value.trim().toLowerCase();

  }
  changePIN(){
    //first we select the current wallet.

    this.selectedWallet = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    //  then we use the vars there and the info on the wallet to decrypt everything:
    this.logger.debug('### Change PIN Page - Current Wallet'+JSON.stringify(this.selectedWallet));
    //get all keys
    this.allKeys = this.walletService.getAllKeys();



    // get mnemonic hash
    const encryptedMnemonicHash = this.selectedWallet.mnemonicHash;
    // get mnemonic words
    const encryptedMnemonicWords = this.localStorageService.get(AppConstants.KEY_WALLET_MNEMONIC_WORDS);
    let oldCrypto = new CSCCrypto(this.oldPIN, this.walletEmail );
    this.logger.debug('### Change PIN Page: encwords ' + JSON.stringify(encryptedMnemonicWords));
    // decrypt mnemonic words
    let decryptedWords = JSON.parse(oldCrypto.decrypt(encryptedMnemonicWords));
    this.logger.debug('### Change PIN Page: decryptedMnemonicWords' + JSON.stringify(decryptedWords));
    this.logger.debug('### Change PIN Page - current wallet prev '+ JSON.stringify(this.selectedWallet));
    // decrypt mnemonic hash
    let decryptedMnemonicHash = oldCrypto.decrypt(encryptedMnemonicHash);
    //encrypt with new PIN and save encrypted  seed to db
    this.logger.debug('### Change PIN Page: new pin: ' +this.newPIN+" email: "+this.walletEmail);
    let newCrypto = new CSCCrypto(""+this.newPIN+"", this.walletEmail);
    let reencryptedMnemonicWords = newCrypto.encrypt(JSON.stringify(decryptedWords));
    let reencryptedMnemonicHash = newCrypto.encrypt((decryptedMnemonicHash));
    //reencrypt all keys
    let updKeys = 0;
    this.allKeys.forEach( key => {
      updKeys++;
      // first decrypt it
      this.logger.debug('### Change PIN Page - will update key '+updKeys+': '+JSON.stringify(key));
      const unencryptedSecret:string = oldCrypto.decrypt(key.secret);
      // now we  encrypt it again
      key.secret = newCrypto.encrypt(unencryptedSecret);
      // now we update the key
      this.walletService.updateKey(key);
      this.logger.debug('### Change PIN Page - Updated key '+updKeys+': '+JSON.stringify(key));
    });

    // add new mnemonicHash to the current wallet.
    this.logger.debug('### Change PIN Page -  '+updKeys+' keys updated ');
    this.selectedWallet.mnemonicHash = reencryptedMnemonicHash;
    this.logger.debug('### Change PIN Page - reencrypted mnemonic hash '+ reencryptedMnemonicHash);
    this.localStorageService.set(AppConstants.KEY_WALLET_MNEMONIC_WORDS, reencryptedMnemonicWords);
    this.logger.debug('### Change PIN Page: reencrypted mnemonic words' + JSON.stringify(reencryptedMnemonicWords));

    // generate the new password hash
    const walletPasswordHash =  this.walletService.generateWalletPasswordHash(this.selectedWallet.walletUUID, this.newPIN);
    // add new password hash to the current wallet.
    this.selectedWallet.passwordHash = walletPasswordHash;
    this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD_HASH, walletPasswordHash);
    this.logger.debug('### Change PIN Page - wallet passwd hash '+ walletPasswordHash);
    this.logger.debug('### Change PIN Page - Reencrypt Wallet Keys');
    // encrypt wallet keys
    this.logger.debug('### Change PIN Page - Encrypt keys now with PIN '+this.newPIN+' and email: '+this.walletEmail);
    console.log("newpin is ",typeof(this.newPIN));
    console.log("walletemail is ",typeof(this.walletEmail));
    // we don't really need this since we already encrypted the keys one by one... but hey! leave me alone.
    this.walletService.encryptAllKeys(""+this.newPIN+"", this.walletEmail).subscribe( result => {
      if (result === AppConstants.KEY_FINISHED) {
        this.logger.debug('### Change PIN Page - Key Encryption Complete');
        // save the wallet
        this.walletService.saveWallet();
      }
    });
    let walletArray: Array<WalletDefinition> = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    const newWalletArray: Array<WalletDefinition> = [];
    walletArray.forEach(wallet => {
      if(wallet.walletUUID === this.selectedWallet.walletUUID){
        // replace this wallet item for the one we changed.
        this.logger.debug('### Change PIN Page - we will change this wallet: '+ JSON.stringify(wallet)+" for this wallet: "+JSON.stringify(this.selectedWallet));
        newWalletArray.push(this.selectedWallet);
      }else{
        newWalletArray.push(wallet);
      }
    });
    this.localStorageService.set(AppConstants.KEY_AVAILABLE_WALLETS, newWalletArray);
    this.logger.debug('### Change PIN Page - new wallet array '+ JSON.stringify(newWalletArray));
    this.logger.debug('### Change PIN Page - Changed PIN complete??');
    this.sessionStorageService.set(AppConstants.KEY_CURRENT_WALLET, this.selectedWallet);
    this.logger.debug('### Change PIN Page - current wallet '+ JSON.stringify(this.selectedWallet));




  }
  onCancel(){
    this.logger.debug('### Change PIN Page - Cancel by location back.###');
    this.location.back();
  }
  onSubmit(form){
    console.log(form);
    if(form.status === "VALID"){
      console.log(
        this.form
      );
      if(this.form.email === this.walletEmail){
        this.newPIN = this.form.pincode;
        this.changePIN();
      }else{
        this.logger.debug('### Change PIN Page - The email provided is not the same email used to create this wallet.###');

      }
    }
  }
}
