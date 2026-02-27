import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SegmentService } from 'ngx-segment-community';
import { concatMap, filter, map } from 'rxjs';

/** */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('playground');
  private readonly _router = inject(Router);
  private readonly _segment = inject(SegmentService);

  /** */
  constructor() {
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => {
          let currentRoute = this._router.routerState.root;

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
          const analyticsProps: unknown =
            snapshot.data['segmentAnalyticsProperties'];
          const safeProps =
            analyticsProps && typeof analyticsProps === 'object'
              ? analyticsProps
              : {};
          return this._segment.page('Main page', undefined, {
            ...safeProps,
            title: snapshot.title,
          });
        }),
        // pointless, but gotta maintain that trigger discipline!
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
