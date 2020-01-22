import { Component, OnInit } from '@angular/core';
import { CSCUtil } from '../../../domains/csc-util';

@Component({
  selector: 'tutorial-module1',
  templateUrl: './module1.component.html',
  styleUrls: ['./module1.component.scss'],
})
export class Module1Component implements OnInit {

  fiat_balance = "0";
  fiatValue = "0";
  coinSupply = "0";
  marketCapital = "0";
  marketVolumeUSD = "0";
  walletCoinInfo = JSON.parse('{"id":"casinocoin","name":"CasinoCoin","symbol":"CSC","rank":"237","price_usd":"0.000807196","price_btc":"0.00000009","price_fiat":"0.000807196","market_24h_volume_usd":"84735.2399659","market_cap_usd":"31996156.0","available_supply":"39638646422.0","total_supply":"39999976367.0","last_updated":"1579727521"}');
  walletBalances = JSON.parse('[{"token":"CSC","balance":"118279700000000","img":"https://github.com/casinocoin/CasinoCoin-Assets/raw/master/v4/casinocoin-icon-256x256.png"},{"token":"PCN","balance":"7200000000","img":"https://raw.githubusercontent.com/casinocoin/CasinoCoin-Assets/master/v4/poker-coin-icon-512.png"}]');

  constructor() { }
  renderCSCAmount(amount){
    return CSCUtil.dropsToCsc(amount);
  }
  ngOnInit() {}

}
