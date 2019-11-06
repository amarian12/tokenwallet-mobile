import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// LoggerModule
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
// Providers


// Pipes
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
// import { AuthGuard } from './auth-guard';
import { CasinocoinService } from './providers/casinocoin.service';
import { LogService } from './providers/log.service';
import { WebStorageModule, LocalStorageService, SessionStorageService, CookiesStorageService } from 'ngx-store';
import { WalletService } from './providers/wallet.service';
import { NotificationService } from './providers/notification.service';
import { MarketService } from './providers/market.service';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WalletSetupModule} from './components/wallet-setup/wallet-setup.module';
import { CSCPipe } from "./domains/app-pipes.module"
// import { WalletSetupComponent } from './components/wallet-setup/wallet-setup.module';
// import { Step1Component } from './components/wallet-setup/steps/step1/step1.component';
// import { Step2Component } from './components/wallet-setup/steps/step2/step2.component';
// import { Step3Component } from './components/wallet-setup/steps/step3/step3.component';
// import { Step4Component } from './components/wallet-setup/steps/step4/step4.component';
// import { Step5Component } from './components/wallet-setup/steps/step5/step5.component';
// import { Step6Component } from './components/wallet-setup/steps/step6/step6.component';
// import { Step7Component } from './components/wallet-setup/steps/step7/step7.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    // Step1Component,
    // Step2Component,
    // Step3Component,
    // Step4Component,
    // Step5Component,
    // Step6Component,
    // Step7Component,

    AppComponent
  ],
  entryComponents: [],
  imports: [
    WalletSetupModule,
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot({
      serverLoggingUrl: '/api/logs',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
     AppRoutingModule],

  providers: [
    StatusBar,
    SplashScreen,
    WalletService,
    CasinocoinService,
    LogService,
    CurrencyPipe,
    DecimalPipe,
    NotificationService,
    MarketService,
    LocalStorageService,
    SessionStorageService,
    CookiesStorageService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
