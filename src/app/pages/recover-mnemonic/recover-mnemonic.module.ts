import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { RecoverMnemonicPage } from './recover-mnemonic.page';
import { MnemonicExistDirective } from './helpers/mnemonic-exist.directive';

const routes: Routes = [
  {
    path: '',
    component: RecoverMnemonicPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [RecoverMnemonicPage, MnemonicExistDirective]
})
export class RecoverMnemonicPageModule {}
