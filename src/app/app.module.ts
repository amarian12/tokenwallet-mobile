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

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
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
