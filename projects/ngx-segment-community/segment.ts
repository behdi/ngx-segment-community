import { computed, inject, Injectable } from '@angular/core';
import { SegmentClient } from './client';
import { SEGMENT_ANALYTICS_SETTINGS } from './provider';

/**
 *
 */
@Injectable()
export class SegmentService {
  private readonly _config = inject(SEGMENT_ANALYTICS_SETTINGS);
  private readonly _s = inject(SegmentClient);

  /**
   * Signal indicating if the analytics client is fully initialized and ready.
   * Useful for showing/hiding UI elements or waiting for analytics to load.
   */
  readonly initialized = computed(() => this._s.initialized());

  /**
   * Creates an instance of the SegmentService.
   *
   * Based on the provided configuration (`initializationMode`), this constructor
   * may automatically trigger the initialization process.
   *
   * - If `initializationMode` is `'automatic'` (default): The service initializes immediately.
   * - If `initializationMode` is `'manual'`: The service waits for you to call `.initialize()`.
   */
  constructor() {
    const mode = this._config.initializationMode ?? 'automatic';
    if (mode === 'automatic') this.initialize();
  }

  /**
   *
   * Manually initializes the analytics instance.
   *
   * - Fetching settings from the segment CDN (by default).
   * - Fetching all remote destinations configured by the user (if applicable).
   * - Flushing buffered analytics events.
   * - Loading all middleware.
   *
   * @remarks
   * - If called when already initialized, it will simply log a warning and return.
   * - It does **NOT** throw an error, making it safe to call multiple times.
   */
  public initialize(): void {
    this._s.initialize({
      writeKey: this._config.writeKey,
      cdnURL: this._config.cdnURL,
    });
  }
}
