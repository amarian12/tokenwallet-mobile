import { NgModule } from '@angular/core';
import { WalletSetupComponent } from './components/wallet-setup/wallet-setup.component';
import { WalletSetupGuard } from './guards/wallet-setup.guard';
import { TabsPageRoutingModule } from './pages/tabs/tabs.router.module';
// import { Step1Component } from './components/wallet-setup/steps/step1/step1.component';
// import { Step2Component } from './components/wallet-setup/steps/step2/step2.component';
// import { Step4Component } from './components/wallet-setup/steps/step4/step4.component';
// import { Step5Component } from './components/wallet-setup/steps/step5/step5.component';
// import { Step6Component } from './components/wallet-setup/steps/step6/step6.component';
// import { Step7Component } from './components/wallet-setup/steps/step7/step7.component';
// import { Step3Component } from './components/wallet-setup/steps/step3/step3.component';

import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate : [WalletSetupGuard]
  },
  {
    path: 'wallet-setup',
    loadChildren: () => import('./components/wallet-setup/wallet-setup.module').then(m => m.WalletSetupModule)
  },
  // { path: 'wallet', loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  // { path: 'history', loadChildren: './pages/history/history.module#HistoryPageModule' },
  // { path: 'exchanges', loadChildren: './pages/exchanges/exchanges.module#ExchangesPageModule' },
  // { path: 'help', loadChildren: './pages/help/help.module#HelpPageModule' },
  // { path: 'main', loadChildren: './pages/main/main.module#MainPageModule' },
  // { path: 'contacts', loadChildren: './pages/contacts/contacts.module#ContactsPageModule' },
  // { path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardPageModule' },
  // { path: 'wallet-setup', component: WalletSetupComponent,
  //     children: [
  //         { path: 'setup-step1', component: Step1Component },
  //         { path: 'setup-step2', component: Step2Component },
  //         { path: 'setup-step3', component: Step3Component },
  //         { path: 'setup-step4', component: Step4Component },
  //         { path: 'setup-step5', component: Step5Component },
  //         { path: 'setup-step6', component: Step6Component },
  //         { path: 'setup-step7', component: Step7Component },
  //         { path: '', redirectTo: 'setup-step1', pathMatch: 'full'}
  //  ]
  // },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
