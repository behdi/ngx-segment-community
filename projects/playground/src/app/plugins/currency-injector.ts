import { inject } from '@angular/core';
import type { SegmentPluginFn } from 'ngx-segment-community';
import { StoreState } from '../services';

/**
 *  A simple plugin that adds the currently selected currency unit to events with
 * `context.requiresCurrency` set to true.
 */
export const CurrencyInjectorPlugin: SegmentPluginFn = () => {
  const store = inject(StoreState);

  return {
    name: 'Currency Injector',
    type: 'enrichment',
    version: '1.0',
    isLoaded: () => true,
    load: () => Promise.resolve(),
    track: (ctx) => {
      if (!ctx.event.context) return ctx;

      const { requiresCurrency, ...rest } = ctx.event.context;
      if (typeof requiresCurrency === 'boolean' && requiresCurrency) {
        ctx.event.properties = ctx.event.properties ?? {};
        ctx.event.properties['currency'] = store.selectedCurrency();
      }

      ctx.event.context = rest;
      return ctx;
    },
  };
};
