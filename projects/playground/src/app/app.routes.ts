import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout').then((l) => l.MainLayout),
    children: [],
  },
];
