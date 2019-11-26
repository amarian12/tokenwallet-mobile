import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../providers/market.service';
import { LogService } from '../../providers/log.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-exchanges',
  templateUrl: './exchanges.page.html',
  styleUrls: ['./exchanges.page.scss'],
})
export class ExchangesPage implements OnInit {

  constructor(
             private logger: LogService,
             public marketService: MarketService,
             public iab: InAppBrowser) { }

  ngOnInit() {
    // this.logger.debug('### Exchange  list: ' + JSON.stringify(this.MarketService.exchanges));

  }

  visitExchange(link) {
    this.logger.debug('### Exchange GetCscPage visit Exchange: ' + link);
    this.iab.create(link, "_system");
  }


}
