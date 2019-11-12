import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { CSCPipe } from '../../../domains/app-pipes.module';

import { IonicModule } from '@ionic/angular';

import { TokenSendPage } from './token-send.page';

const routes: Routes = [
  {
    path: '',
    component: TokenSendPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CSCPipe.forRoot(),
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TokenSendPage]
})
export class TokenSendPageModule {}
