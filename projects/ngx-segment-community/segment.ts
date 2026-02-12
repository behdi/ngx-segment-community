import { computed, inject, Injectable } from '@angular/core';
import {
  type Callback,
  type Context,
  type EventProperties,
  type Options,
  type UserTraits,
} from '@segment/analytics-next';
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

  /**
   * Allows you tie a user to their actions and record traits about them.
   *
   * It includes a unique User ID and any optional traits you know about the user, such
   * as their email and name.
   *
   * Segment recommends against using an Identify call for anonymous visitors to your site. Analytics.js
   * automatically retrieves an `anonymousId` from localStorage or assigns one for new visitors, and then
   * attaches it to all Page and Track events both before and after an Identify call.
   *
   * @param [userId] - The database ID for the user. If you don't know who the user is yet, you can pass
   * undefined and just record traits
   * @param [traits] - A dictionary of traits you know about the user, like `email` or `name`.
   * Can be some of the reserved traits, or any custom ones. Only use reserved traits for their intended meaning.
   * @param [options] - A dictionary of options. For example, enable or disable specific destinations for the call.
   * @param [callback] - A function executed after a timeout of 300 ms, giving the browser time to make outbound requests
   * first.
   * @returns A promise that resolves to the dispatched event.
   *
   * @example
   * segment.identify('userId123', {
   *    email: 'user@example.com',
   *    name: 'John Doe'
   * });
   * @see {@link https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#identify | Identify Docs}
   */
  public identify(
    userId?: string,
    traits?: UserTraits,
    options?: Options,
    callback?: Callback,
  ): Promise<Context> {
    return this._s.client.identify(userId, traits, options, callback);
  }

  /**
   * Allows you to record actions your users perform.
   *
   * Each action is known as an event. Each event has a name, like "User Registered", and some properties.
   * For example, a "User Registered" event _might_ have properties like `plan` or `accountType`.
   *
   * @param eventName - The name of the event you're tracking
   * @param [properties] - A dictionary of properties containing extra pieces of information you can tie
   * to events you track. They can be anything that will be useful while analyzing the events later.
   * @param [options] - A dictionary of options. For example, enable or disable specific destinations for the call.
   * @param [callback] - A function executed after a timeout of 300 ms, giving the browser time to make outbound requests
   * first.
   * @returns — A promise that resolves to a dispatched event.
   *
   * @example
   * segment.track("User Registered", {
   *   plan: "Pro Annual",
   *   accountType: "Facebook"
   *  }
   *
   * @see {@link https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/website/javascript#track | Track Docs}
   * @see {@link https://www.twilio.com/en-us/resource-center/naming-conventions-for-clean-data | Best practices for event naming}
   */
  public track(
    eventName: string,
    properties?: EventProperties,
    options?: Options,
    callback?: Callback,
  ): Promise<Context> {
    return this._s.client.track(eventName, properties, options, callback);
  }
}
