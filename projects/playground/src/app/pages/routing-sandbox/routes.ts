import { Routes } from '@angular/router';
import {
  SegmentRouterData,
  SegmentRouterIgnore,
} from 'ngx-segment-community/utils';

export const CONTENT_KEY = Symbol(
  'Symbol to easily fetch the content of the dummy page',
);

export const sandboxRoutes: Routes = [
  {
    path: 'standard',
    loadComponent: () => import('./dummy').then((c) => c.Dummy),
    title: 'Standard Routing Page', // Will track natively
    data: {
      [CONTENT_KEY]:
        'Standard routing page with native Angular router title, ' +
        'which should send a simple Page event to Segment',
    },
  },
  {
    path: 'custom-data',
    loadComponent: () => import('./dummy').then((c) => c.Dummy),
    data: {
      [CONTENT_KEY]:
        'Page without a native Angular router title, instead using a ' +
        'custom Segment category, title and properties',
      segment: new SegmentRouterData('Checkout Flow', 'Step 1', {
        cartValue: 99,
      }),
    },
  },
  {
    path: 'ignored',
    title: 'Ignored Page',
    loadComponent: () => import('./dummy').then((c) => c.Dummy),
    data: {
      [CONTENT_KEY]:
        `Page that will not send a Segment page event, because it's marked ` +
        'as ignored, using SegmentRouterIgnore',
      ignore: new SegmentRouterIgnore(),
    },
  },
  {
    path: 'cascade-parent',
    loadComponent: () => import('./dummy').then((c) => c.Dummy),

    data: {
      [CONTENT_KEY]:
        "Page that is ignored in a cascading manner; meaning all of it's child routes " +
        'will also be ignored',
      ignore: new SegmentRouterIgnore({ cascade: true }),
    },
    children: [
      {
        path: 'silenced-child',
        loadComponent: () => import('./dummy').then((c) => c.Dummy),
        data: {
          [CONTENT_KEY]:
            'The child component to a parent router outlet who is ignoring Segment page events in a ' +
            'cascading manner',
          segment: new SegmentRouterData('I will never track'),
        },
      },
      {
        path: '**',
        redirectTo: 'silenced-child',
      },
    ],
  },
  { path: '**', redirectTo: 'standard' },
];
