import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { WalletSettings } from '../../domains/csc-types';
import { TranslateService } from '@ngx-translate/core';
import { AppflowService } from '../../providers/appflow.service';
import { LogService } from '../../providers/log.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
walletSettings: WalletSettings
  constructor(
    private appflow:AppflowService,
    private logger:LogService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private alert: AlertController

  ) { }

  ngOnInit() {
    this.walletSettings = this.appflow.walletSettings;


  }
  ionViewWillEnter(){
    if(this.appflow.dark){
      this.walletSettings.styleTheme = "dark";
    }else{
      this.walletSettings.styleTheme = "light";
    }
  }
  saveSettings(){
    this.logger.debug(" ### Settings Page :: Settings to be saved : " + JSON.stringify(this.walletSettings));
    this.logger.debug(" ### Settings Page :: Settings on appflow : " + JSON.stringify(this.appflow.walletSettings));
    this.appflow.saveWalletSettings(this.walletSettings);
    this.themeChanged();
    this.langChanged();
    this.router.navigate(['/']);
  }
  discardSettings(){
    this.logger.debug(" ### Settings Page :: Settings to be discarded : " + JSON.stringify(this.walletSettings));
    this.walletSettings = this.appflow.getWalletSettings();


    this.logger.debug(" ### Settings Page :: Reverting to Settings: " + JSON.stringify(this.walletSettings));
    this.router.navigate(['/']);

  }
  themeChanged(){
    if(this.walletSettings.styleTheme == "light"){
      this.appflow.dark = false;
    }else{
      this.appflow.dark = true;

    }
  }
  langChanged(){
    this.translate.use(this.walletSettings.walletLanguage);
  }
}
