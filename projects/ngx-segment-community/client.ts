import {
  computed,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {
  AnalyticsBrowser,
  type AnalyticsBrowserSettings,
  type InitOptions,
} from '@segment/analytics-next';
import {
  SEGMENT_ANALYTICS_SETTINGS,
  SEGMENT_DESTINATION_MIDDLEWARE,
  SEGMENT_PLUGIN,
  SEGMENT_SOURCE_MIDDLEWARE,
} from './provider';

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
  private readonly _injector = inject(Injector);
  private readonly _sourceMiddlewares = inject(SEGMENT_SOURCE_MIDDLEWARE, {
    optional: true,
  });
  private readonly _destinationMiddlewares = inject(
    SEGMENT_DESTINATION_MIDDLEWARE,
    { optional: true },
  );
  private readonly _plugins = inject(SEGMENT_PLUGIN, { optional: true });

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
   * Creates an instance of SegmentClient.
   *
   * Performs the following:
   * - Registers source middlewares (if there are any)
   * - Registers destination middlewares (if there are any)
   */
  constructor() {
    this._registerSourceMiddlewares();
    this._registerDestinationMiddlewares();
    this._registerPlugins();
  }

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
   * @param options - Extra options when initializing segment.
   */
  initialize(settings: AnalyticsBrowserSettings, options: InitOptions) {
    const { timeout, debug } = this._config;

    if (this._isLoading()) return;
    if (this._isReady()) {
      console.warn('[Segment] Already initialized. Skipping.');
      return;
    }

    this._isLoading.set(true);

    this._browser
      .load({ ...settings }, { ...options })
      .then(([analytics]) => {
        this._isReady.set(true);
        this._hasError.set(false);

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

  private _registerSourceMiddlewares(): void {
    if (!this._sourceMiddlewares?.length) return;

    const injectableSourceMiddlewares = this._sourceMiddlewares.map((fn) =>
      runInInjectionContext(this._injector, fn),
    );

    injectableSourceMiddlewares.forEach((fn) => {
      this.client
        .addSourceMiddleware(fn)
        .catch((e: unknown) =>
          console.error(
            '[Segment] Source middleware registration failed with error:',
            e,
          ),
        );
    });
  }

  private _registerDestinationMiddlewares(): void {
    if (!this._destinationMiddlewares?.length) return;

    const destMiddlewares = this._destinationMiddlewares.map(
      ({ integrationName, middlewares }) => ({
        integrationName,
        middlewares: middlewares.map((fn) =>
          runInInjectionContext(this._injector, fn),
        ),
      }),
    );

    destMiddlewares.forEach(({ integrationName, middlewares }) => {
      this.client
        .addDestinationMiddleware(integrationName, ...middlewares)
        .catch((e: unknown) =>
          console.error(
            '[Segment] Destination middleware registration failed with error:',
            e,
          ),
        );
    });
  }

  private _registerPlugins() {
    if (!this._plugins?.length) return;

    const plugins = this._plugins.map((pluginFactoryFn) =>
      runInInjectionContext(this._injector, pluginFactoryFn),
    );

    plugins.forEach((p) => {
      this.client
        .register(p)
        .catch((e: unknown) =>
          console.error(
            `[Segment] Could not register plugin "${p.name}" due to the following error:`,
            e,
          ),
        );
    });
  }
}
