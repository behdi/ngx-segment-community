export * from './ngx-segment-analytics.config';
export * from './ngx-segment-analytics.module';
export * from './ngx-segment-analytics.service';
export * from './window-wrapper';

// Modern implementation
export {
  provideSegmentAnalytics,
  type SegmentAnalyticsConfiguration,
} from './provider';
export { SegmentService as NewSegmentService } from './segment';
