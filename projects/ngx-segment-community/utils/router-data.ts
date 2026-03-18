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
