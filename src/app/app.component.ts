import { Component } from '@angular/core';
import { LogService } from './providers/log.service';
import { AppflowService } from './providers/appflow.service';

import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  dark = false;
  userName = "";

  constructor(
    private appflow: AppflowService,
    private platform: Platform,
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
      this.userName = this.appflow.userName;
      this.translate.setDefaultLang('en');
      this.statusBar.styleDefault();
      this.splashScreen.hide();

    });
  }
}
