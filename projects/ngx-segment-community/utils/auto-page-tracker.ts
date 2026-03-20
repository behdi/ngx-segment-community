import { inject, provideAppInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SegmentService, ɵcreateSegmentUtility } from 'ngx-segment-community';
import { concatMap, filter, map } from 'rxjs';
import { SegmentRouterData } from './router-data';

/**
 * Enables automatic tracking of Segment `page` events on Angular router navigation.
 *
 * This utility hooks into the router's `NavigationEnd` event, drilling down to the primary
 * outlet's leaf node to extract routing metadata and automatically fire `segment.page()`.
 *
 * By default, the tracker uses the native Angular `title` property of the route as the page name.
 * To provide a custom Segment category, override the page name, or attach custom event properties,
 * provide an instance of {@link SegmentRouterData} anywhere inside the route's `data` object.
 *
 *
 * **Setup:**
 * Pass this utility as an argument to `provideSegmentAnalytics` in your application config:
 * ```ts
 * provideSegmentAnalytics(
 *  withSettings({ writeKey: 'YOUR_WRITE_KEY' }),
 *  withAutomaticPageTracking()
 * );
 * ```
 *
 * **Route Configuration Example:**
 * ```ts
 * const routes: Routes = [
 *  // 1. Native fallback. Tracks as: page('Storefront')
 *  {
 *    path: 'store',
 *    title: 'Storefront',
 *    component: StoreComponent
 *  },
 *  // 2. Custom properties. Tracks as: page('Contact', undefined, { version: 'v2' })
 *  {
 *    path: 'contact',
 *    title: 'Contact',
 *    component: ContactComponent,
 *    data: {
 *      segment: new SegmentRouterData({ version: 'v2' })
 *    }
 *  }
 * ];
 * ```
 */
export function withAutomaticPageTracking() {
  return ɵcreateSegmentUtility(
    provideAppInitializer(() => {
      const router = inject(Router);
      const segment = inject(SegmentService);

      router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          map(() => {
            let currentRoute = router.routerState.root;

            while (currentRoute.children.length > 0) {
              const primaryChild = currentRoute.children.find(
                (c) => c.outlet === 'primary', // 'primary' is Angular's default outlet name
              );

              if (!primaryChild) break;
              // eslint-disable-next-line fp/no-mutation
              currentRoute = primaryChild;
            }

            return currentRoute;
          }),
          concatMap(({ snapshot }) => {
            const segmentData = Object.values(snapshot.data).filter(
              (v) => v instanceof SegmentRouterData,
            );

            if (segmentData.length > 1) {
              if (typeof ngDevMode !== 'undefined' && ngDevMode)
                console.warn(
                  '[Segment] Cannot track page event. Multiple SegmentRouterData instances found in route data. ' +
                    'This usually happens when using `paramsInheritanceStrategy: "always"` and assigning different keys in parent and child routes. ' +
                    'To fix this, use the exact same key (e.g., `data: { segment: ... }`) across all routes so Angular safely overwrites them.',
                );
              return Promise.resolve();
            }

            const { category, name, properties } = segmentData.at(0) ?? {};

            const routeTitle = name ?? snapshot.title;
            const safeCategory = category ?? routeTitle;
            const safeTitle = category ? routeTitle : undefined;

            if (!safeCategory) {
              if (typeof ngDevMode !== 'undefined' && ngDevMode)
                console.warn(
                  '[Segment] Cannot track page event. The resulting page `category` or `name` evaluates to an empty string. Please make sure to provide a valid, non-empty string via the route `title` or `SegmentRouterData`.',
                );

              return Promise.resolve();
            }

            return segment.page(safeCategory, safeTitle, properties);
          }),
          // pointless, but gotta maintain that trigger discipline!
          takeUntilDestroyed(),
        )
        .subscribe();
    }),
  );
}
