import { inject, provideAppInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SegmentService, ɵcreateSegmentUtility } from 'ngx-segment-community';
import { concatMap, filter, map } from 'rxjs';
import { SegmentRouterData } from './router-data';

/** @inheritdoc */
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
            const { category, name, properties } =
              Object.values(snapshot.data).find(
                (v) => v instanceof SegmentRouterData,
              ) ?? {};

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
