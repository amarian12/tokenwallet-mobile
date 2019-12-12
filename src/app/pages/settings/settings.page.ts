import { Component, OnInit } from '@angular/core';
import {  WalletSettings } from '../../domains/csc-types';
import {  AppflowService } from '../../providers/appflow.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
walletSettings: WalletSettings
  constructor(private appflow:AppflowService) { }

  ngOnInit() {
    this.walletSettings = this.appflow.walletSettings;


  }
  saveSettings(){
    console.log("THIS WOULD BE SAVED: ", this.walletSettings)
    this.appflow.saveWalletSettings(this.walletSettings);

  }

}
