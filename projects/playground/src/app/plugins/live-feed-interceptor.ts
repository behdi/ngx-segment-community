import { inject } from '@angular/core';
import type { SegmentPluginFn } from 'ngx-segment-community';
import { EventFeed } from '../services';

/**
 * Creates a plugin that interceptors most events and adds it to the event feed service.
 */
export const LiveFeedInterceptorPlugin: SegmentPluginFn = () => {
  const feedService = inject(EventFeed);

  return {
    name: 'Live Feed Interceptor',
    type: 'after',
    version: '1.0.0',
    isLoaded: () => true,
    load: () => Promise.resolve(),
    track: (ctx) => {
      feedService.logEvent(ctx.event);
      return ctx;
    },
    identify: (ctx) => {
      feedService.logEvent(ctx.event);
      return ctx;
    },
    page: (ctx) => {
      feedService.logEvent(ctx.event);
      return ctx;
    },
  };
};
