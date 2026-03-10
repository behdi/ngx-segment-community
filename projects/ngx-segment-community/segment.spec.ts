import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { SegmentClient } from './client';
import {
  SEGMENT_ANALYTICS_SETTINGS,
  type SegmentAnalyticsSettings,
} from './provider';
import { SegmentService } from './segment';

describe('SegmentService (segment.ts)', () => {
  let mockClient: SegmentClient;
  let mockBrowserClient: jasmine.SpyObj<AnalyticsBrowser>;

  beforeEach(() => {
    mockBrowserClient = jasmine.createSpyObj<AnalyticsBrowser>(
      'AnalyticsBrowser',
      [
        'identify',
        'track',
        'trackLink',
        'page',
        'group',
        'alias',
        'ready',
        'reset',
      ],
    );

    mockClient = {
      initialized: signal(true),
      initialize: jasmine.createSpy('initialize'),
      client: mockBrowserClient,
    } as unknown as SegmentClient;
  });

  describe('Initialization Modes', () => {
    const configureTestingModuleWithSegmentSettings = (
      settings: SegmentAnalyticsSettings,
    ) => {
      TestBed.configureTestingModule({
        providers: [
          SegmentService,
          { provide: SegmentClient, useValue: mockClient },
          {
            provide: SEGMENT_ANALYTICS_SETTINGS,
            useValue: settings,
          },
        ],
      });
    };

    it('should initialize automatically if mode is "automatic"', () => {
      configureTestingModuleWithSegmentSettings({
        writeKey: 'TEST',
        initializationMode: 'automatic',
      });

      TestBed.inject(SegmentService);
      expect(mockClient.initialize).toHaveBeenCalled();
    });

    it('should initialize automatically if mode is omitted (default behavior)', () => {
      configureTestingModuleWithSegmentSettings({ writeKey: 'TEST' }); // No mode provided

      TestBed.inject(SegmentService);
      expect(mockClient.initialize).toHaveBeenCalled();
    });

    it('should NOT initialize automatically if mode is "manual"', () => {
      configureTestingModuleWithSegmentSettings({
        writeKey: 'TEST',
        initializationMode: 'manual',
      });

      const service = TestBed.inject(SegmentService);
      expect(mockClient.initialize).not.toHaveBeenCalled();

      // But it should work when called manually
      service.initialize();
      expect(mockClient.initialize).toHaveBeenCalled();
    });

    it('should map and pass all advanced configuration options correctly to the client', () => {
      const fullConfig = {
        writeKey: 'TEST_KEY',
        cdnURL: 'https://custom-cdn.segment.com',
        disable: true,
        obfuscate: true,
        disableAutoISOConversion: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        integrations: { All: false, 'Google Analytics': true },
        initializationMode: 'manual' as const, // Manual so we can trigger it cleanly
      };

      configureTestingModuleWithSegmentSettings(fullConfig);

      const service = TestBed.inject(SegmentService);
      service.initialize();

      expect(mockClient.initialize).toHaveBeenCalledWith(
        {
          writeKey: 'TEST_KEY',
          cdnURL: 'https://custom-cdn.segment.com',
        },
        {
          disable: true,
          obfuscate: true,
          disableAutoISOConversion: true,
          integrations: { All: false, 'Google Analytics': true },
        },
      );
    });

    it('should coerce undefined boolean flags to false to ensure strict types', () => {
      configureTestingModuleWithSegmentSettings(
        // Omit all optional flags
        { writeKey: 'TEST_KEY', initializationMode: 'manual' },
      );

      const service = TestBed.inject(SegmentService);
      service.initialize();

      expect(mockClient.initialize).toHaveBeenCalledWith(
        {
          writeKey: 'TEST_KEY',
          cdnURL: undefined,
        },
        {
          disable: false,
          obfuscate: false,
          disableAutoISOConversion: false,
          integrations: undefined,
        },
      );
    });
  });

  describe('API Pass-throughs', () => {
    let service: SegmentService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          SegmentService,
          { provide: SegmentClient, useValue: mockClient },
          {
            provide: SEGMENT_ANALYTICS_SETTINGS,
            useValue: {
              writeKey: 'TEST',
              // Keep it manual to prevent auto-booting in tests
              initializationMode: 'manual',
            },
          },
        ],
      });
      service = TestBed.inject(SegmentService);
    });

    it('should expose the initialized signal', () => {
      expect(service.initialized()).toBeTrue();
    });

    it('should pass identify calls to the client', () => {
      const traits = { email: 'test@test.com' };
      void service.identify('user-1', traits);
      expect(mockBrowserClient.identify).toHaveBeenCalledWith(
        'user-1',
        traits,
        undefined,
        undefined,
      );
    });

    it('should pass track calls to the client', () => {
      const props = { item: 'Coffee' };
      void service.track('Added to Cart', props);
      expect(mockBrowserClient.track).toHaveBeenCalledWith(
        'Added to Cart',
        props,
        undefined,
        undefined,
      );
    });

    it('should pass trackLink calls to the client', () => {
      const el = document.createElement('a');
      void service.trackLink(el, 'Clicked Link');
      expect(mockBrowserClient.trackLink).toHaveBeenCalledWith(
        el,
        'Clicked Link',
        undefined,
        undefined,
      );
    });

    it('should pass page calls to the client', () => {
      void service.page('Store', 'Checkout');
      expect(mockBrowserClient.page).toHaveBeenCalledWith(
        'Store',
        'Checkout',
        undefined,
        undefined,
        undefined,
      );
    });

    it('should pass group calls to the client', () => {
      const traits = { site: 'Vice City, Florida' };
      void service.group('gruppe-sechs', traits);
      expect(mockBrowserClient.group).toHaveBeenCalledWith(
        'gruppe-sechs',
        traits,
        undefined,
        undefined,
      );
    });

    it('should pass alias calls to the client', () => {
      void service.alias('new-id', 'old-id');
      expect(mockBrowserClient.alias).toHaveBeenCalledWith(
        'new-id',
        'old-id',
        undefined,
        undefined,
      );
    });

    it('should pass whenReady calls to the client ready method', () => {
      const cb = () => {
        /* empty */
      };
      void service.whenReady(cb);
      expect(mockBrowserClient.ready).toHaveBeenCalledWith(cb);
    });

    it('should pass reset calls to the client', () => {
      void service.reset();
      expect(mockBrowserClient.reset).toHaveBeenCalled();
    });
  });
});
