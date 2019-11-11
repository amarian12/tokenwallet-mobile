import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { CSCPipe } from '../../../domains/app-pipes.module';

import { IonicModule } from '@ionic/angular';

import { HistoryDetailPage } from './history-detail.page';

const routes: Routes = [
  {
    path: '',
    component: HistoryDetailPage
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
  declarations: [HistoryDetailPage]
})
export class HistoryDetailPageModule {}
