import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
          }
        ]
      },
      {
        path: 'dashboard/settings',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../settings/settings.module').then(m => m.SettingsPageModule)
          }
        ]
      },
      {
        path: 'dashboard/about',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../about/about.module').then(m => m.AboutPageModule)
          }
        ]
      },
      {
        path: 'wallet',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../wallet/wallet.module').then(m => m.WalletPageModule)
          },
          {
            path: 'add-token/:toAccount',
            loadChildren: () =>
              import('../wallet/wallet.module').then(m => m.WalletPageModule)
          },
          {
            path: 'token-receive/:tokenId',
            loadChildren: () =>
              import('../wallet/token-receive/token-receive.module').then(m => m.TokenReceivePageModule)
          },
          {
            path: 'token-send/:origin',
            loadChildren: () =>
              import('../wallet/token-send/token-send.module').then(m => m.TokenSendPageModule)
          },
          {
            path: 'token-send/:origin/:destination',
            loadChildren: () =>
              import('../wallet/token-send/token-send.module').then(m => m.TokenSendPageModule)
          },
          {
            path: 'filter/:filterToken',
            loadChildren: () =>
              import('../wallet/wallet.module').then(m => m.WalletPageModule)
          },
          {
            path: ':tokenId',
            loadChildren: () =>
              import('../wallet/token-detail/token-detail.module').then(m => m.TokenDetailPageModule)
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
          },
          {
            path: ':transactionId',
            loadChildren: () =>
              import('../history/history-detail/history-detail.module').then(m => m.HistoryDetailPageModule)
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
          },
          {
            path: 'add-contact',
            loadChildren: () =>
              import('../contacts/add-contact/add-contact.module').then(m => m.AddContactPageModule)
          },
          {
            path: 'edit/:loki',
            loadChildren: () =>
              import('../contacts/add-contact/add-contact.module').then(m => m.AddContactPageModule)
          },
          {
            path: 'add-contact/:action',
            loadChildren: () =>
              import('../contacts/add-contact/add-contact.module').then(m => m.AddContactPageModule)
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
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
