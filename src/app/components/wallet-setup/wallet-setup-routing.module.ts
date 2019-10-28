import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WalletSetupComponent } from './wallet-setup.component';

const routes: Routes = [
  {
    path: '',
    component: WalletSetupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletSetupRoutingModule { }
