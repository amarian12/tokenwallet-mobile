import { Component } from '@angular/core';
import { LogService } from './providers/log.service';
import { AppflowService } from './providers/appflow.service';
import { WalletService } from './providers/wallet.service';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// import { EloMenuController } from './providers/custommenu.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  dark = false;
  userName = "";
  language = "";
  currency = "";
  isConnected = false;
    versionNumber:string;

  constructor(
    private appflow: AppflowService,
    private walletService: WalletService,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private translate: TranslateService,
    private logger: LogService,
    private statusBar: StatusBar
  ) {
    this.initializeApp();

  }

  initializeApp() {

    this.platform.ready().then(() => {
      this.logger.debug('### App initialized::::::::::::::');
      // debug('### AppConfig: ' + JSON.stringify(AppConfig));
      this.logger.debug('### Setting default lang: en');
      this.versionNumber = this.walletService.appVersionString;
      this.userName = this.appflow.userName;
      this.dark = this.appflow.dark;
      this.language = this.appflow.language;
      this.currency = this.appflow.currency;
      this.translate.setDefaultLang(this.language);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.appflow.connectedStatus.subscribe(
        connected => {
          this.isConnected = connected;
          this.logger.debug('### App component: connected to casinocoin::::::::::::::::: connected: '+connected);

        }
      );


    });

  }
  logOut(){

    this.logger.debug('### App component: LOGOUT!!!: ');
    this.appflow.authCorrect = false;
    this.appflow.loggedIn = false;
    this.router.navigate(['/login']);
  }
  ionViewWillEnter(){

  }
}
