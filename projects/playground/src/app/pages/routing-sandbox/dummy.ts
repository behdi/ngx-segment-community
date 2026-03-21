import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CONTENT_KEY } from './routes';

/** 'Dynamic' component responsible for rendering the Routing Sandbox's child components. */
@Component({
  selector: 'app-dummy',
  imports: [RouterOutlet, MatDivider],
  template: `
    <p>{{ content() }}</p>

    <mat-divider />

    <router-outlet />
  `,

  styleUrl: './dummy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dummy {
  private readonly _router = inject(ActivatedRoute);

  protected readonly content = toSignal(
    this._router.data.pipe(
      map((d) => (typeof d[CONTENT_KEY] === 'string' ? d[CONTENT_KEY] : '')),
      filter(Boolean),
    ),
    { initialValue: 'Barren & empty! Select a tab!' },
  );
}
