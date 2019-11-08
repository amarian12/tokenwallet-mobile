import { NgModule } from '@angular/core';
import { CSCPipe } from '../../domains/app-pipes.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HistoryPage } from './history.page';

const routes: Routes = [
  {
    path: '',
    component: HistoryPage
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
  providers: [
    DecimalPipe,
    CurrencyPipe
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule {}
