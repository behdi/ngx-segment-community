export * from './ngx-segment-analytics.config';
export * from './ngx-segment-analytics.module';
export * from './ngx-segment-analytics.service';
export * from './window-wrapper';

// Modern implementation
export {
  provideSegmentAnalytics,
  withDestinationMiddlewares,
  withPlugins,
  withSettings,
  withSourceMiddlewares,
  type SegmentAnalyticsSettings,
  type SegmentDestinationMiddlewareFn,
  type SegmentFeatures,
  type SegmentPluginFn,
  type SegmentSettings,
  type SegmentSourceMiddlewareFn,
} from './provider';
export { SegmentService as NewSegmentService } from './segment';
