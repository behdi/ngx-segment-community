import { Injectable, signal } from '@angular/core';
import type { SegmentEvent } from '@segment/analytics-next';

/** Service responsible for holding the event feed in the current instance. */
@Injectable({
  providedIn: 'root',
})
export class EventFeed {
  private readonly _events = signal<SegmentEvent[]>([]);

  /** Signal containing an array of segment event objects. */
  readonly events = this._events.asReadonly();

  /**
   * Adds the given payload to the list of events.
   *
   * @param payload - the event's json payload
   */
  logEvent(payload: SegmentEvent) {
    this._events.update((current) => [payload, ...current]);
  }

  /** Clears all events. */
  clear() {
    this._events.set([]);
  }
}
