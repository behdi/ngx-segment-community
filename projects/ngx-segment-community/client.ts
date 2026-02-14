import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AnalyticsBrowser,
  type AnalyticsBrowserSettings,
} from '@segment/analytics-next';
import { SEGMENT_ANALYTICS_SETTINGS } from './provider';

/**
 * The internal singleton driver for Segment Analytics.
 *
 * This service is responsible for holding the actual `AnalyticsBrowser` instance
 * and managing its lifecycle (loading, error states, and ready status).
 *
 * It is provided in `root` to ensure a single instance exists across the application,
 * but it is NOT exposed in the public API to prevent consumers from accidentally
 * re-providing it or bypassing the main `SegmentService` facade.
 *
 * @internal
 */
@Injectable({
  providedIn: 'root',
})
export class SegmentClient {
  private readonly _config = inject(SEGMENT_ANALYTICS_SETTINGS);

  /** The raw Segment Analytics browser instance. */
  private readonly _browser = new AnalyticsBrowser();

  /** Signal indicating if the browser is currently in the process of loading. */
  private readonly _isLoading = signal(false);

  /** Signal indicating if the browser has successfully completed initialization. */
  private readonly _isReady = signal(false);

  /** Signal indicating if the last initialization attempt failed. */
  private readonly _hasError = signal(false);

  /**
   * Signal indicating whether the client is fully loaded and ready for use.
   *
   * It returns `false` during the loading phase or if initialization failed.
   */
  readonly initialized = computed(() => {
    const isInitialized = this._isReady();
    const isInitializing = this._isLoading();

    return !isInitializing && isInitialized;
  });

  /**
   * Accessor for the underlying `AnalyticsBrowser` instance.
   * Use this to call `track`, `identify`, etc.
   */
  readonly client = this._browser;

  /**
   * Initializes the Segment Analytics browser with the provided settings.
   *
   * This method implements a "Fire and Forget" strategy. It does not return a Promise.
   * - If initialization is already in progress, it returns immediately.
   * - If initialization is already complete, it logs a warning and returns.
   * - Errors during loading are caught, logged to console, and the internal `_hasError` state is set.
   * They are NOT re-thrown, ensuring the application boot process is not interrupted.
   *
   * @param settings - The Segment configuration object (must include `writeKey`).
   */
  initialize(settings: AnalyticsBrowserSettings) {
    const { timeout, debug } = this._config;

    if (this._isLoading()) return;
    if (this._isReady()) {
      console.warn('[Segment] Already initialized. Skipping.');
    }

    this._isLoading.set(true);

    this._browser
      .load({ ...settings })
      .then(([analytics]) => {
        this._isReady.set(true);

        // Apply global configs directly to the guaranteed-ready instance
        if (typeof timeout === 'number') analytics.timeout(timeout);
        analytics.debug(!!debug);
      })
      .catch((e: unknown) => {
        console.error('[Segment] Initialization failed', e);
        this._hasError.set(true);
      })
      .finally(() => this._isLoading.set(false));
  }
}
