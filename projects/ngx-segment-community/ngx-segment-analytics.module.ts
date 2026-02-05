import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { SEGMENT_CONFIG, SegmentConfig } from './ngx-segment-analytics.config';
import { SegmentService } from './ngx-segment-analytics.service';

/**
 * Segment Module
 */
@NgModule({
  imports: [CommonModule],
})
export class SegmentModule {
  /**
   * Segment Module Initialisation
   *
   * @param config Segment Configuration
   * @returns Segment Module
   */
  public static forRoot(
    config?: SegmentConfig,
  ): ModuleWithProviders<SegmentModule> {
    return {
      ngModule: SegmentModule,
      providers: [
        { provide: SEGMENT_CONFIG, useValue: config },
        SegmentService,
      ],
    };
  }

  /**
   * Segment Module Constructor
   *
   * @param parentModule Must be null
   */
  constructor(@Optional() @SkipSelf() parentModule: SegmentModule) {
    if (parentModule) {
      throw new Error(
        'SegmentModule is already loaded. Import it in the AppModule only',
      );
    }
  }
}
