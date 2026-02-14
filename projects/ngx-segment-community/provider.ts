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
