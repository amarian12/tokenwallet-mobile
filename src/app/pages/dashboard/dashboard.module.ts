import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardPage } from './dashboard.page';

import { WalletSetupModule } from '../../components/wallet-setup/wallet-setup.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage
  }
];

@NgModule({
  imports: [
    TranslateModule.forChild(),
    CommonModule,
    FormsModule,
    IonicModule,
    WalletSetupModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DashboardPage
  ]
})
export class DashboardPageModule {}
