import {
  type EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { SegmentService } from './segment';

export interface SegmentAnalyticsConfiguration {
  /**
   * The API Key (Write Key) used to identify the source in Segment.
   * @see {@link https://segment.com/docs/connections/find-writekey/ | Locate your Write Key}
   */
  writeKey: string;

  /**
   * If provided, will override the default Segment CDN (https://cdn.segment.com)
   * Use this to proxy requests through your own domain to bypass ad-blockers.
   *
   * @example 'https://analytics.my-domain.com'
   */
  cdnURL?: string;

  /**
   * Defines when the analytics service should initialize.
   * - `automatic`: (Default) Initializes immediately upon service construction.
   * - `manual`: User must call `.initialize()` explicitly. Useful for when user consent
   * is required to start tracking.
   */
  initializationMode?: 'manual' | 'automatic';

  /**
   * Indicates whether debug mode should be turned on.
   *
   * Debug mode logs helpful messages in the console.
   *
   * @see {@link https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/website/javascript#debug | Debug Docs}
   */
  debug?: boolean;

  /**
   * Specifies the length (in milliseconds) of callbacks and helper functions.
   *
   * Useful if you have multiple scripts that need to fire in your callback, or the `trackLink` functions.
   *
   * **NOTE:**
   * If you're triggering ad network conversion pixels, Segment recommends extending timeout to 500 ms to account for slow load times.
   *
   * @see {@link https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/website/javascript#extending-timeout | Timeout Docs}
   */
  timeout?: number;

  /**
   * Whether event sending should be disabled.
   *
   * If set to `true`, all analytics method calls will be a no-op, and no network calls will be initiated.
   *
   * For testing or staging environments, it can be useful to disable your SDK to ensure no events are sent.
   */
  disable?: boolean;
}

export const SEGMENT_ANALYTICS_SETTINGS =
  new InjectionToken<SegmentAnalyticsConfiguration>(
    '[ngx-segment-community] Configuration',
  );

/**
 * Configures and initializes the Segment Analytics integration.
 *
 * @param config - The static configuration (Write Key, CDN, etc).
 * @returns An `EnvironmentProvider` set for use in `app.config.ts` or Route providers.
 */
export function provideSegmentAnalytics(
  config: SegmentAnalyticsConfiguration,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SEGMENT_ANALYTICS_SETTINGS, useValue: config },
    SegmentService,
  ]);
}
