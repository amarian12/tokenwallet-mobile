import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackGuard } from '../../guards/back.guard';
import { WalletSetupComponent } from './wallet-setup.component';

const routes: Routes = [
  {
    path: 'wallet-setup',
    component: WalletSetupComponent,
    canActivate: [BackGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletSetupRoutingModule { }
