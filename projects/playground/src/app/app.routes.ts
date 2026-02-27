import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout').then((l) => l.MainLayout),
    children: [
      {
        path: 'main',
        loadComponent: () =>
          import('./pages/main-page').then((c) => c.MainPage),
      },
      {
        path: 'storefront',
        data: { segmentAnalyticsProperties: { on_call: true } },
        loadComponent: () =>
          import('./pages/storefront-page').then((c) => c.AboutPage),
      },
      { path: '**', redirectTo: 'main' },
    ],
  },
];
