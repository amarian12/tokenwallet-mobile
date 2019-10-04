import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'wallet',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../main/main.module').then(m => m.MainPageModule)
          }
        ]
      },
      {
        path: 'history',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../history/history.module').then(m => m.HistoryPageModule)
          }
        ]
      },
      {
        path: 'exchanges',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../exchanges/exchanges.module').then(m => m.ExchangesPageModule)
          }
        ]
      },
      {
        path: 'contacts',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../contacts/contacts.module').then(m => m.ContactsPageModule)
          }
        ]
      },
      {
        path: 'help',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../help/help.module').then(m => m.HelpPageModule)
          }
        ]
      },

      {
        path: '',
        redirectTo: '/tabs/wallet',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/wallet',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
