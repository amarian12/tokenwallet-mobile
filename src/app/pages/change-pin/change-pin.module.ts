import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ValidatorsModule } from '../../directives/validators/validators.module';

import { ChangePinPage } from './change-pin.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePinPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ValidatorsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ChangePinPage]
})
export class ChangePinPageModule {}
