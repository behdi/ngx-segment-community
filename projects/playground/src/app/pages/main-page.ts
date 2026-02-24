import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Component responsible for rendering the main page. */
@Component({
  selector: 'app-main-page',
  imports: [],
  template: ` <p>main-page works!</p> `,
  styleUrl: './main-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage {}
