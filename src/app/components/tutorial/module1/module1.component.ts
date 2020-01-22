import { Component, OnInit } from '@angular/core';

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
  
  constructor() { }

  ngOnInit() {}

}
