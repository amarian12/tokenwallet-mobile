import { Component } from '@angular/core';
import { AppConstants } from './domains/app-constants';
import { NotificationService, SeverityType } from './providers/notification.service';
import { CasinocoinService} from './providers/casinocoin.service';
import { LogService } from './providers/log.service';
import { AppflowService } from './providers/appflow.service';
import { WalletService } from './providers/wallet.service';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
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
  versionNumber = "";


  constructor(
    public appflow: AppflowService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private casinocoinService: CasinocoinService,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private translate: TranslateService,
    private net: Network,
    private localStorageService: LocalStorageService,
    private logger: LogService,
    private statusBar: StatusBar,
    private appVersion: AppVersion
  ) {
    this.initializeApp();

  }

  initializeApp() {

    this.platform.ready().then(() => {
      // let con = this.net.onConnect().subscribe(() => {
      //
      //       this.logger.debug('###MainApp: CONECTED! network was connected  again :-)');
      //       this.notificationService.addMessage( {severity: SeverityType.info,
      //                                             title: 'Network found!',
      //                                             body: 'App will try to connect to CasinoCoin Blockchain Now.'
      //                                            });
      //       // alert("FirstPage connected again!");
      //        this.casinocoinService.connect();
      //
      //  });
      //  let discon = this.net.onDisconnect().subscribe(() => {
      //
      //    if (this.net.type == 'none'){
      //      this.logger.debug('### MainApp: no network, trying when we have network');
      //      this.notificationService.addMessage( {severity: SeverityType.error,
      //                                            title: 'No network found',
      //                                            body: 'App will try to connect to CasinoCoin Blockchain as soon as a network connection is detected.'
      //                                           });
      //
      //
      //    }else{
      //      this.logger.debug('### MainApp: DISCONECTED type of net:'+this.net.type);
      //      this.logger.debug('### MainApp: Trying to reconnect one more time');
      //      // this.casinocoinService.connect();
      //
      //    }
      //
      //
      //   });
      this.logger.debug('### App initialized::::::::::::::');
      // debug('### AppConfig: ' + JSON.stringify(AppConfig));
      this.logger.debug('### Setting default lang: en');
      if (this.platform.is('cordova')) {
        this.appVersion.getVersionNumber().then(value => {
          this.appflow.versionNumber = value;
          this.versionNumber = this.appflow.versionNumber;
        });
      } else {

        this.appflow.versionNumber = "0.1.15.browser";
        this.versionNumber = this.appflow.versionNumber;
      }
      this.appflow.network = this.localStorageService.get(AppConstants.KEY_PRODUCTION_NETWORK)?"Production":"Testnet";
      // make the app go to login and auth on resume.
      this.platform.pause.subscribe(async () => {
          setTimeout(() =>
          {
            this.appflow.authCorrect = false;
            this.appflow.loggedIn = false;
            this.router.navigate(['/login']);
          },
          420000);
        });
      this.userName = this.appflow.userName;
      this.dark = this.appflow.dark;
      this.language = this.appflow.language;
      this.currency = this.appflow.currency;
      this.translate.setDefaultLang('en');
      this.translate.use(this.language);
      // this.statusBar.styleDefault();
      if (this.platform.is('ios')){
        // this.statusBar.overlaysWebView(false);
        // this.statusBar.backgroundColorByHexString("#be0a09");
        this.statusBar.styleDefault();
      }else{
        this.statusBar.styleLightContent();
      }
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
  exit(){
    navigator['app'].exitApp();
  }
  ionViewWillEnter(){

  }
}
