import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { CSCPipe } from '../../../domains/app-pipes.module';

import { IonicModule } from '@ionic/angular';
import { TokenDetailPage } from './token-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TokenDetailPage
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
  declarations: [TokenDetailPage]
})
export class TokenDetailPageModule {}
