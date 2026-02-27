import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { SegmentService } from 'ngx-segment-community';

type AuthState = 'IDLE' | 'LOGGED_IN' | 'LOGGED_OUT' | 'ERROR';

/** Component responsible for rendering the main page. */
@Component({
  selector: 'app-main-page',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
  ],
  template: `
    <div class="container">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Initialize </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p>Test the initialization of Segment.</p>
          <p>Current State:</p>
          <pre> isInitialized: {{ currentInitializationState() }}</pre>
          @if (currentInitializationState()) {
            <p>
              Clicking on the "Initialize" button will log a warning in the
              console in dev mode.
            </p>
          }
        </mat-card-content>

        <mat-card-actions>
          <button matButton (click)="onInitialize()">Initialize</button>
        </mat-card-actions>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Login</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p>Test whether identify correctly works</p>

          <p>Current State:</p>
          <pre> isLoggedIn: {{ isLoggedIn() }}</pre>
        </mat-card-content>

        <mat-card-actions>
          <button matButton (click)="onLogin()">Login</button>
        </mat-card-actions>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Logout </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p>Test whether reset correctly works</p>

          <p>Current State:</p>
          <pre> isLoggedOut: {{ isLoggedOut() }}</pre>
        </mat-card-content>

        <mat-card-actions>
          <button matButton (click)="onLogout()">Logout</button>
        </mat-card-actions>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Track a simple event </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p>Test whether track works correctly</p>
        </mat-card-content>

        <mat-card-actions>
          <button matButton (click)="onTrack()">Track something!</button>
        </mat-card-actions>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Track Link</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>
            Test whether trackLink correctly binds to a DOM element and delays
            navigation.
          </p>
          <a #outboundLink mat-button href="https://segment.com">
            Go to Segment (External)
          </a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './main-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage {
  private readonly _segment = inject(SegmentService);

  private readonly _authState = signal<AuthState>('IDLE');
  private readonly _outboundLink = viewChild.required<
    MatButton,
    ElementRef<HTMLAnchorElement>
  >('outboundLink', { read: ElementRef<HTMLAnchorElement> });

  protected readonly currentInitializationState = this._segment.initialized;
  protected readonly isLoggedIn = computed(
    () => this._authState() === 'LOGGED_IN',
  );
  protected readonly isLoggedOut = computed(
    () => this._authState() === 'LOGGED_OUT',
  );

  /** */
  constructor() {
    this._registerOutboundLinkTracking();
  }

  protected onInitialize() {
    this._segment.initialize();
  }

  protected onLogin() {
    this._segment
      .identify(
        'admin_user',
        { id: 'random_id', gender: 'tester_bot' },
        { context: { ip: '0.0.0.0' } },
      )
      .then(() => {
        this._authState.set('LOGGED_IN');
      })
      .catch((e: unknown) => {
        console.error('Login tracking failed', e);
        this._authState.set('ERROR');
      });
  }

  protected onLogout() {
    this._segment
      .reset()
      .then(() => {
        this._authState.set('LOGGED_OUT');
      })
      .catch((e: unknown) => {
        console.error('Logout tracking failed', e);
        this._authState.set('ERROR');
      });
  }

  protected onTrack() {
    void this._segment.track('Testing tack method', { place: 'test-card' });
  }

  private _registerOutboundLinkTracking() {
    effect(() => {
      const anchor = this._outboundLink();

      untracked(() => {
        void this._segment.trackLink(
          anchor.nativeElement,
          'Tracking outbound link',
          {
            destination: anchor.nativeElement.href,
          },
        );
      });
    });
  }
}
