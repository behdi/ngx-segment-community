import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EventFeed } from '../services/event-feed';

/**
 * Component responsible for displaying the main layout
 */
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIcon,
    MatIconButton,
    MatListModule,
    RouterLink,
    RouterLinkActive,
    JsonPipe,
  ],
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header-container">
      <mat-toolbar>
        <span>ngx-segment-community</span>
        <span class="spacer"></span>
      </mat-toolbar>
    </header>

    <mat-drawer-container class="main-content-container">
      <mat-drawer mode="side" opened position="start">
        <mat-nav-list>
          <a mat-list-item routerLink="/main" routerLinkActive="active">
            Home
          </a>

          <a mat-list-item routerLink="/storefront" routerLinkActive="active">
            Storefront
          </a>
        </mat-nav-list>
      </mat-drawer>

      <mat-drawer-content class="main-content">
        <div class="content-container">
          <router-outlet />
        </div>
      </mat-drawer-content>

      <mat-drawer class="sidebar-event-feed" mode="side" opened position="end">
        <div class="container">
          <div class="feed-header">
            <h3>Live Event Feed</h3>
            <button mat-icon-button (click)="clearEvents()" title="Clear Feed">
              <mat-icon>delete</mat-icon>
            </button>
          </div>

          <div class="event-dump">
            @for (event of events(); track $index) {
              <pre><code>{{ event | json }}</code></pre>
            } @empty {
              <p>Waiting for events... Click a button on the left!</p>
            }
          </div>
        </div>
      </mat-drawer>
    </mat-drawer-container>
  `,
})
export class MainLayout {
  private readonly _eventFeed = inject(EventFeed);

  protected readonly events = this._eventFeed.events;

  protected clearEvents() {
    this._eventFeed.clear();
  }
}
