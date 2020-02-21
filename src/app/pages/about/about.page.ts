import { Component, OnInit } from '@angular/core';
import { AppflowService } from '../../providers/appflow.service';
import { LogService } from '../../providers/log.service';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  versionNumber:string;
  constructor(
    private logger: LogService,
    public appflow: AppflowService,
    public iab: InAppBrowser,
    private translate: TranslateService
  ) {
    this.versionNumber = this.appflow.versionNumber;
  }
  openCSCURL(url:string){
    const link = 'https://casinocoin.org/'+url+'/';
    this.logger.debug('### About Page:  open CasinCoin.Org URL : ' + link);
    this.iab.create(link, "_system");
    //return  'http://testexplorer.casinocoin.org/tx/' + this.transactionLoaded.txID;
  }
  ngOnInit() {
  }

}
