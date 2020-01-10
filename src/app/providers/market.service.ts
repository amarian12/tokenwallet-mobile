import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LogService } from './log.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { CoinMarketCapType, ExchangesType } from '../domains/service-types';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../domains/app-constants';
// import { SelectItem } from 'primeng/components/common/selectitem';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

    private coinmarketCapURLCSC: string = "https://api.coinmarketcap.com/v1/ticker/casinocoin/";
    // private coinmarketCapURLBTC: string = "https://api.coinmarketcap.com/v1/ticker/bitcoin/";
    private exchangesURL: string = "https://api.casinocoin.org/1.0.0/info/exchanges/all";
    // private coinmarketCapURLCSC: string = "https://brmdev.duoex.com/info/coininfo";
    // private exchangesURL: string = "https://brmdev.duoex.com/info/exchanges/all";
    public coinMarketInfo: CoinMarketCapType;
    public exchanges: Array<ExchangesType>;
    private checkInterval: any;
    public exchangeUpdates = new Subject<Array<ExchangesType>>();
    public btcPrice: number = 1;
    public cscPrice: number = 0.00000001;
    public fiatCurrency = 'USD';

    constructor(private logger: LogService,
                private http: HttpClient,
                private platform: Platform,
                private localStorageService: LocalStorageService) {
        logger.debug("### INIT  MarketService ###");
        // get the stored coin info from localstorage
        this.coinMarketInfo = this.localStorageService.get(AppConstants.KEY_COININFO);
        // this.fiatCurrency = this.localStorageService.get(AppConstants.KEY_BRM_USER).Currency;

        this.fiatCurrency = "USD"
        this.initAutoUpdateServices();
    }

    initAutoUpdateServices(){
        // run the getCoinInfo method
        // this.getCoinInfo();
        // run a timer to get the coininfo every set interval of 120 seconds
        this.checkInterval = setInterval(() => {
            if(!this.localStorageService.get(AppConstants.KEY_LAST_UPDATED_COININFO)){
              this.localStorageService.set(AppConstants.KEY_LAST_UPDATED_COININFO, 0 );
            }
            const lastupdated = this.localStorageService.get(AppConstants.KEY_LAST_UPDATED_COININFO);
            const thishour = Math.floor(Date.now() / 900000);

            if( thishour > lastupdated){
              this.logger.debug("### MarketService - updating states :  lastupdated: " + lastupdated +" thishour "+ thishour);
              this.localStorageService.set(AppConstants.KEY_LAST_UPDATED_COININFO,thishour);
              this.updateCoinInfo();

            }

        }, 120000);
        // get exchanges
        this.getExchanges();
        // run a timer to get the exchange info every set interval of 60 seconds
        this.checkInterval = setInterval(() => {
            this.getExchanges();
        }, 60000);
    }

    changeCurrency(currency) {
        this.fiatCurrency = currency;
        this.updateCoinInfo();
    }

    getCoinInfo():CoinMarketCapType {
        return this.localStorageService.get(AppConstants.KEY_COININFO);
    }

    updateCoinInfo(){
        let options = {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        };
        if(!this.platform.is('cordova')) {
            this.coinmarketCapURLCSC = "http://localhost:8000/";
            // this.exchangesURL = "/coinmarketCapURLBTCApi";
            this.logger.debug("### MarketService - added proxy - API: " + this.coinmarketCapURLCSC);
        }
        // let serviceResponse = new Subject<CoinMarketCapType>();
        this.http.get(this.coinmarketCapURLCSC + "?convert=" + this.fiatCurrency, options).subscribe(result => {
            this.logger.debug("### MarketService: " + JSON.stringify(result));
            let coinInfo = result[0];
            if(coinInfo){
                this.coinMarketInfo = {
                    id: coinInfo.id,
                    name: coinInfo.name,
                    symbol: coinInfo.symbol,
                    rank: coinInfo.rank,
                    price_usd: coinInfo.price_usd,
                    price_btc: coinInfo.price_btc,
                    price_fiat: coinInfo['price_' + this.fiatCurrency.toLowerCase()],
                    market_24h_volume_usd: coinInfo['24h_volume_usd'],
                    market_cap_usd: coinInfo.market_cap_usd,
                    available_supply: coinInfo.available_supply,
                    total_supply: coinInfo.total_supply,
                    last_updated: coinInfo.last_updated
                }
                // store in localstorage
                this.localStorageService.set(AppConstants.KEY_COININFO, this.coinMarketInfo);
                this.logger.debug("### KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK   MarketService - Recorded new coininfo: " + JSON.stringify(this.coinMarketInfo));
                // put onto subject
                // serviceResponse.next(this.coinMarketInfo);
            }
        });
        // this.http.get(this.coinmarketCapURLBTC, options).subscribe(result => {
        //     let coinInfo = result[0];
        //     if(coinInfo){
        //         this.btcPrice = Number(coinInfo.price_usd);
        //     }
        // });
        // return serviceResponse.asObservable();
    }

    getExchanges() {
        let options = {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        };
        if(!this.platform.is('cordova')) {
            this.coinmarketCapURLCSC = "http://localhost:8000/";
            // this.exchangesURL = "/coinmarketCapURLBTCApi";
            this.logger.debug("### MarketService - added proxy - API: " + this.coinmarketCapURLCSC );
        }
        this.http.get<Array<ExchangesType>>(this.exchangesURL, options).subscribe(result => {
            this.exchanges = result;
            // get max last price
            this.cscPrice = 0.00000001;
            this.exchanges.forEach(exchange => {
                if(exchange.last > this.cscPrice){
                    this.cscPrice = exchange.last;
                }
            });
            this.exchangeUpdates.next(this.exchanges);
        });
    }
}
