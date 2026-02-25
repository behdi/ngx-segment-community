import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideSegmentAnalytics,
  withPlugins,
  withSettings,
} from 'ngx-segment-community';
import { env } from '../environments';
import { routes } from './app.routes';
import { LiveFeedInterceptorPlugin } from './plugins';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideSegmentAnalytics(
      withSettings({
        // Create a file called `environment.local.ts`, add your writeKey there, and then serve
        // the project in development mode
        writeKey: env.SEGMENT_API_KEY,
        initializationMode: 'manual',
        debug: true,
      }),
      withPlugins([LiveFeedInterceptorPlugin]),
    ),
  ],
};
