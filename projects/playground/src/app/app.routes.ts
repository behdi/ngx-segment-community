import { Routes } from '@angular/router';
import { SegmentRouterData } from 'ngx-segment-community/utils';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout').then((l) => l.MainLayout),
    children: [
      {
        path: 'main',
        data: {
          segment: new SegmentRouterData('Page title', {
            prop1: 'value',
          }),
        },
        loadComponent: () =>
          import('./pages/main-page').then((c) => c.MainPage),
      },
      {
        path: 'storefront',
        title: 'marketplace',
        data: { segment: { on_call: true } },
        loadComponent: () =>
          import('./pages/storefront-page').then((c) => c.AboutPage),
      },
      {
        path: 'routing-sandbox',
        loadComponent: () =>
          import('./pages/routing-sandbox/sandbox').then((c) => c.Sandbox),
        loadChildren: () =>
          import('./pages/routing-sandbox/routes').then((r) => r.sandboxRoutes),
      },
      { path: '**', redirectTo: 'main' },
    ],
  },
];
