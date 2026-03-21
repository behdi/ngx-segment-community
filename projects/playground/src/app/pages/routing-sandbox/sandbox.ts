import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

/** Main playground  for the auto page tracking feature. */
@Component({
  selector: 'app-routing-sandbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  styleUrl: './sandbox.scss',
  template: ` <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      @for (tab of tabs; track tab.route) {
        <a
          #rla="routerLinkActive"
          mat-tab-link
          routerLinkActive
          [routerLink]="tab.route"
          [relativeTo]="currRoute"
          [active]="rla.isActive"
        >
          {{ tab.label }}
        </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel>
      <router-outlet />
    </mat-tab-nav-panel>`,
})
export class Sandbox {
  protected readonly currRoute = inject(ActivatedRoute);

  protected readonly tabs = [
    {
      route: 'standard',
      label: 'Standard',
    },
    {
      route: 'custom-data',
      label: 'Custom Data',
    },
    {
      route: 'ignored',
      label: 'Ignored',
    },
    {
      route: 'cascade-parent',
      label: 'Cascading Parent',
    },
  ];
}
