/* eslint-disable fp/no-mutation */
import type { EventProperties } from '@segment/analytics-next';

/**
 * Class representing data that should be set as page information when
 * sending a page event to Segment.
 *
 * Place an instance of this class inside an Angular Route's `data` property.
 * The tracker will automatically find it and extract the metadata.
 *
 * Only useful if {@link withAutomaticPageTracking} is used.
 */
export class SegmentRouterData {
  public readonly category?: string;
  public readonly name?: string;
  public readonly properties?: EventProperties;

  /**
   * Initializes page tracking data with only custom properties.
   *
   * @param props - Properties that should be attached to the page event.
   */
  constructor(props: EventProperties);

  /**
   * Initializes page tracking data with a specific name and optional properties.
   *
   * @param name - Name of the page. You should generally rely on the `title` property of the route itself,
   * but this allows for overrides.
   * @param props - Optional properties that should be attached to the page event.
   */
  constructor(name: string, props?: EventProperties);

  /**
   * Initializes page tracking data with a category, name, and optional properties.
   *
   * @param category - Category of the page (e.g., 'E-Commerce').
   * @param name - Name of the page (e.g., 'Checkout').
   * @param props - Optional properties that should be attached to the page event.
   */
  constructor(category: string, name: string, props?: EventProperties);

  /**
   * Internal implementation of the constructor overloads.
   *
   * @internal
   * @param arg1 - Properties, Name, or Category
   * @param arg2 - Properties or Name
   * @param arg3 - Properties
   */
  constructor(
    arg1: EventProperties | string,
    arg2?: EventProperties | string,
    arg3?: EventProperties,
  ) {
    // Narrow down first overload
    if (typeof arg1 !== 'string') {
      this.properties = arg1;
      return;
    }

    // In defiance of god and all things holy, narrow down the third overload
    if (typeof arg2 === 'string') {
      this.category = arg1;
      this.name = arg2;
      this.properties = arg3;
      return;
    }

    // Set properties based on the second overload
    this.category = undefined;
    this.name = arg1;
    this.properties = arg2;
  }
}

/**
 * Configuration options for the {@link SegmentRouterIgnore} kill switch.
 */
interface SegmentRouterIgnoreConfig {
  /**
   * If `true`, the tracking opt-out will cascade down to all child routes in that branch.
   * If `false` or undefined, only the specific route where this is applied will be ignored.
   *
   * @remarks
   * Note: If your router uses `paramsInheritanceStrategy: 'always'`, Angular natively copies parent data to children.
   * This will cause a child route to inherit the ignore instance, effectively making `cascade: false` act like `true`.
   */
  cascade: boolean;
}

/**
 * A metadata class used to prevent the automatic page tracker from firing.
 *
 * Attach an instance of this class to a route's `data` object to act as a tracking kill switch.
 * By default, it only prevents tracking if the route is the final destination (leaf node).
 * To silence an entire branch of routes, initialize it with `{ cascade: true }`.
 *
 * Only useful if {@link withAutomaticPageTracking} is used.
 *
 * @example
 * ```ts
 * const routes: Routes = [
 *  {
 *    path: 'admin',
 *    // Silences '/admin' and all its children (e.g., '/admin/users')
 *    data: { ignore: new SegmentRouterIgnore({ cascade: true }) },
 *    children: [ ... ]
 *  },
 *  {
 *    path: 'health-check',
 *    // Only silences the '/health-check' route itself
 *    data: { ignore: new SegmentRouterIgnore() }
 *  }
 * ];
 * ```
 */
export class SegmentRouterIgnore {
  public readonly cascade: boolean = false;

  /**
   * Initializes a new instance of the tracking kill switch.
   *
   * Attach an instance of this class to a route's `data` object to act as a tracking kill switch.
   * By default, it only prevents tracking if the route is the final destination (leaf node).
   *
   * Only useful if {@link withAutomaticPageTracking} is used.
   *
   * @param configuration Optional settings to dictate the behavior of the ignore flag.
   * If omitted, the ignore behavior strictly applies to the route where it is declared.
   *
   * @example
   * ```ts
   * const routes: Routes = [
   *  {
   *    path: 'admin',
   *    // Silences '/admin' and all its children (e.g., '/admin/users')
   *    data: { ignore: new SegmentRouterIgnore({ cascade: true }) },
   *    children: [ ... ]
   *  },
   *  {
   *    path: 'health-check',
   *    // Only silences the '/health-check' route itself
   *    data: { ignore: new SegmentRouterIgnore() }
   *  }
   * ];
   * ```
   */
  constructor(configuration?: Partial<SegmentRouterIgnoreConfig>) {
    this.cascade = !!configuration?.cascade;
  }
}
