import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { path: 'wallet', loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  { path: 'history', loadChildren: './pages/history/history.module#HistoryPageModule' },
  { path: 'exchanges', loadChildren: './pages/exchanges/exchanges.module#ExchangesPageModule' },
  { path: 'help', loadChildren: './pages/help/help.module#HelpPageModule' },
  { path: 'main', loadChildren: './pages/main/main.module#MainPageModule' },
  { path: 'contacts', loadChildren: './pages/contacts/contacts.module#ContactsPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
