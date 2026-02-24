import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Component responsible for rendering the about page. */
@Component({
  selector: 'app-about-page',
  imports: [],
  template: ` <p>about-page works!</p> `,
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
