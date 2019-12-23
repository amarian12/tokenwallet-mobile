import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { CSCPipe } from '../../domains/app-pipes.module';
import { IonicModule } from '@ionic/angular';

import { WalletPage } from './wallet.page';
import { AddTokenComponent } from './add-token/add-token.component';
import { CustomPinComponent } from '../login/custom-pin/custom-pin.component';

const routes: Routes = [
  {
    path: '',
    component: WalletPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    CSCPipe.forRoot(),
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [WalletPage, AddTokenComponent,CustomPinComponent],
  providers: [
    DecimalPipe,
    CurrencyPipe
  ],
  entryComponents:[
    AddTokenComponent,
    CustomPinComponent
  ]
})
export class WalletPageModule {}
