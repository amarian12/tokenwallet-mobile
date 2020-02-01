import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ValidatorsModule } from '../../directives/validators/validators.module';
import { RecoverMnemonicPage } from './recover-mnemonic.page';

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
    ValidatorsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [RecoverMnemonicPage]
})
export class RecoverMnemonicPageModule {}
