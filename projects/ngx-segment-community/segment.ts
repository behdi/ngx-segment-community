import { computed, inject, Injectable } from '@angular/core';
import {
  GroupTraits,
  type Analytics,
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

  /**
   *  Attaches a Track call as a handler to a link.
   *
   * When a user clicks the link, `trackLink` delays the navigation event by 300 ms.
   * This ensures the Track request has enough time to leave the browser before the page unloads.
   *
   * **CRITICAL SPA WARNING**:
   * Only use this for **external links** (e.g., exiting to a marketing site).
   * Do NOT use this for internal Angular router links. It will force a full page reload,
   * breaking the Single Page Application experience.
   *
   * @param linkEls - DOM element to bind with track method.
   * @param event - String or a function that returns a string to use as the name of the track event.
   * @param [properties] - A dictionary of properties, or a function returning a dictionary of promises that
   * contains extra pieces of information you can tie to events you track. They can be anything that will be
   * useful while analyzing the events later.
   * @param [options] - A dictionary of options. For example, enable or disable specific destinations for the call.
   * @returns A promise that resolves to the Analytics instance (for chaining).
   */
  public trackLink(
    linkEls: Element | Element[],
    event: string | (() => string),
    properties?: EventProperties | (() => EventProperties),
    options?: Options,
  ): Promise<Analytics> {
    return this._s.client.trackLink(linkEls, event, properties, options);
  }

  /**
   * Allows you to record page views on your application, along with optional extra information
   * about the page viewed by the user.
   *
   * When you trigger a Page call, make sure the call happens after the UI element are successfully displayed,
   * not when it is called. It **shouldn't** be called as part of the click event that initiates it.
   *
   *
   * @param categoryOrName - The category of the page. Useful for cases like e-commerce where many pages might
   * live under a single category. Note that if you pass a value to this parameter, but not to the next one, it will
   * be considered as `name`. This parameter will only be considered to be category IF you pass a value for the
   * second parameter as well.
   * @param [name] - The name of the page.
   * @param [properties] - A dictionary of properties of the page. Note: Analytics.js collects `url`, `title`, `referrer`,
   * and `path` automatically. This defaults to a canonical url, if available, and falls back to `document.location.href`.
   * For the most part, you need to set `referrer` and `title` manually but the rest of the values will be properly
   * filled.
   * @param [options] - A dictionary of options. For example, enable or disable specific destinations for the call.
   * @param [callback] - A function executed after a timeout of 300 ms, giving the browser time to make outbound requests
   * first.
   * @returns A promise that resolves to a dispatched event.
   *
   * @example
   * analytics.page('Pricing', {
   *  // automatically set, you can override like so
   *  url: 'https://segment.com/pricing',
   *  path: '/pricing',
   *
   *  // You need to manually set these:
   *  title: 'Segment Pricing',
   *  referrer: 'https://segment.com/warehouses'
   * });
   *
   * @see {@link https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/website/javascript#page | Page Docs}
   */
  public page(
    categoryOrName: string,
    name?: string,
    properties?: EventProperties,
    options?: Options,
    callback?: Callback,
  ): Promise<Context> {
    return this._s.client.page(
      categoryOrName,
      name,
      properties,
      options,
      callback,
    );
  }

  /**
   * Associates an identified user with a company, organization, project, workspace, team, tribe, platoon,
   * assemblage, cluster, troop, gang, party, society, or any other collective noun you come up with.
   *
   * The Group call enables you to identify what account or organization your users are part of. A user can
   * be in more than one group which would mean different `groupId`s, but the user will only have one `userId`
   *  that is associated to each of the different groups.
   *
   * **Keep in mind that not all platforms support multiple groups for a single user.**
   *
   * @param groupId - The Group ID to associate with the current user, which should be a unique identifier for the group
   * in your database.
   * @param [traits] - A dictionary of traits containing the pieces of information you know about a group. Example traits
   * for a group include `address`, `website` and `employees`.
   * Can be some of the reserved traits, or any custom ones. Only use reserved traits for their intended meaning.
   * @param [options] - A dictionary of options. For example, enable or disable specific destinations for the call.
   * @param [callback] - A function executed after a timeout of 300 ms, giving the browser time to make outbound requests
   * first.
   * @returns A promise that resolves to the dispatched event.
   *
   * @example
   * analytics.group('gruppe-sechs', {
   *  site: 'Vice City, Florida',
   *  statedGoals: 'Security by any means necessary',
   *  industry: 'Security'
   * });
   *
   *
   * @see {@link https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/website/javascript#group | Group Docs}
   */
  public group(
    groupId: string,
    traits?: GroupTraits,
    options?: Options,
    callback?: Callback,
  ): Promise<Context> {
    return this._s.client.group(groupId, traits, options, callback);
  }
}
