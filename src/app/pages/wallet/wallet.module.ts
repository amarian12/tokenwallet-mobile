import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { CSCPipe } from '../../domains/app-pipes.module';
import { IonicModule } from '@ionic/angular';

import { WalletPage } from './wallet.page';
import { AddTokenComponent } from './add-token/add-token.component';

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
    RouterModule.forChild(routes)
  ],
  declarations: [WalletPage, AddTokenComponent],
  providers: [
    DecimalPipe,
    CurrencyPipe
  ],
  entryComponents:[
    AddTokenComponent
  ]
})
export class WalletPageModule {}
