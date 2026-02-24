import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  ],
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header-container">
      <mat-toolbar>
        <span>ngx-segment-community</span>
        <span class="spacer"></span>
        <button matIconButton aria-label="Log out button">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    </header>

    <mat-drawer-container class="sidebar">
      <mat-drawer mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/main" routerLinkActive="active">
            Home
          </a>

          <a mat-list-item routerLink="/about" routerLinkActive="active">
            About
          </a>
        </mat-nav-list>
      </mat-drawer>
    </mat-drawer-container>

    <main class="main-content">
      <div class="content-container">
        <router-outlet />
      </div>
    </main>
  `,
})
export class MainLayout {}
