import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule } from '@ionic/angular';

import { TokenReceivePage } from './token-receive.page';

const routes: Routes = [
  {
    path: '',
    component: TokenReceivePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    QRCodeModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TokenReceivePage]
})
export class TokenReceivePageModule {}
