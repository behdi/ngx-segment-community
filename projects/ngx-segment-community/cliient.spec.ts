import {
  type EnvironmentProviders,
  inject,
  InjectionToken,
  type Provider,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  type Analytics,
  type AnalyticsBrowser,
  type Context,
} from '@segment/analytics-next';
import { SEGMENT_BROWSER, SegmentClient } from './client';
import {
  SEGMENT_ANALYTICS_SETTINGS,
  SEGMENT_DESTINATION_MIDDLEWARE,
  SEGMENT_PLUGIN,
  SEGMENT_SOURCE_MIDDLEWARE,
  type SegmentAnalyticsSettings,
} from './provider';

describe('SegmentClient', () => {
  let service: SegmentClient;

  let mockBrowser: jasmine.SpyObj<AnalyticsBrowser>;
  let mockResolvedAnalytics: Analytics;

  beforeEach(() => {
    mockResolvedAnalytics = {
      timeout: jasmine.createSpy('timeout'),
      debug: jasmine.createSpy('debug'),
    } as unknown as Analytics;

    mockBrowser = jasmine.createSpyObj<AnalyticsBrowser>('AnalyticsBrowser', [
      'load',
      'addSourceMiddleware',
      'addDestinationMiddleware',
      'register',
    ]);

    mockBrowser.load.and.resolveTo([mockResolvedAnalytics, {} as Context]);
    mockBrowser.addSourceMiddleware.and.resolveTo();
    mockBrowser.addDestinationMiddleware.and.resolveTo();
    mockBrowser.register.and.resolveTo();

    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  describe('Core Initialization', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: SEGMENT_ANALYTICS_SETTINGS,
            useValue: { writeKey: 'TEST_KEY', timeout: 500, debug: true },
          },
          { provide: SEGMENT_BROWSER, useValue: mockBrowser },
        ],
      });
      service = TestBed.inject(SegmentClient);
    });

    it('should boot with correct initial signals', () => {
      expect(service.initialized()).toBeFalse();
      expect(service.client).toBe(mockBrowser);
    });

    it('should load segment and set ready state on success', fakeAsync(() => {
      service.initialize({ writeKey: 'TEST_KEY' }, {});
      tick();

      expect(mockBrowser.load).toHaveBeenCalledWith(
        { writeKey: 'TEST_KEY' },
        {},
      );
      expect(mockResolvedAnalytics.timeout).toHaveBeenCalledWith(500);
      expect(mockResolvedAnalytics.debug).toHaveBeenCalledWith(true);
      expect(service.initialized()).toBeTrue();
    }));

    it('should handle load failures gracefully', fakeAsync(() => {
      mockBrowser.load.and.rejectWith(new Error('Network failure'));

      service.initialize({ writeKey: 'TEST_KEY' }, {});
      tick();

      expect(console.error).toHaveBeenCalledWith(
        '[Segment] Initialization failed',
        jasmine.any(Error),
      );
      expect(service.initialized()).toBeFalse();
    }));

    it('should ignore subsequent initialization attempts if currently LOADING', fakeAsync(() => {
      // Fire the first call. It is now pending.
      service.initialize({ writeKey: 'TEST_KEY' }, {});

      // Fire the second call IMMEDIATELY.
      service.initialize({ writeKey: 'ANOTHER_KEY' }, {});

      // Resolve the queue
      tick();

      // The underlying SDK should only have been called once
      expect(mockBrowser.load).toHaveBeenCalledTimes(1);
      // It should NOT trigger the warn, because it hit the silent 'loading' guard, not the 'ready' guard
      expect(console.warn).not.toHaveBeenCalled();
    }));

    it('should log a warning and ignore if already INITIALIZED', fakeAsync(() => {
      // Fire and finish the first call
      service.initialize({ writeKey: 'TEST_KEY' }, {});
      tick();

      // Attempt to initialize again
      service.initialize({ writeKey: 'ANOTHER_KEY' }, {});

      expect(mockBrowser.load).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        '[Segment] Already initialized. Skipping.',
      );
    }));
  });

  describe('Dependency Injection Contexts (Plugins & Middlewares)', () => {
    const PROOF_TOKEN = new InjectionToken<string>('PROOF_TOKEN');

    const configureTestingModuleWith = (
      extraProviders: Array<EnvironmentProviders | Provider>,
    ) => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: SEGMENT_ANALYTICS_SETTINGS,
            useValue: {
              writeKey: 'TEST_KEY',
            } satisfies SegmentAnalyticsSettings,
          },
          {
            provide: SEGMENT_BROWSER,
            useValue: mockBrowser satisfies AnalyticsBrowser,
          },

          // The proof token.
          { provide: PROOF_TOKEN, useValue: 'DI_SUCCESS' satisfies string },
          ...extraProviders,
        ],
      });

      service = TestBed.inject(SegmentClient);
    };

    it('should run source middleware factories in an injection context', () => {
      let injectedValue: string | undefined;

      const mockMwFactory = jasmine
        .createSpy('mockMwFactory')
        .and.callFake(() => {
          injectedValue = inject(PROOF_TOKEN);
          return () => {
            /* empty */
          };
        });

      configureTestingModuleWith([
        { provide: SEGMENT_SOURCE_MIDDLEWARE, useValue: [mockMwFactory] },
      ]);

      expect(mockMwFactory).toHaveBeenCalled();
      expect(injectedValue).toBe('DI_SUCCESS');
      expect(mockBrowser.addSourceMiddleware).toHaveBeenCalled();
    });

    it('should run destination middleware factories in an injection context', () => {
      let injectedValue: string | undefined;

      const mockMwFactory = jasmine
        .createSpy('mockMwFactory')
        .and.callFake(() => {
          injectedValue = inject(PROOF_TOKEN);
          return () => {
            /* empty */
          };
        });

      configureTestingModuleWith([
        {
          provide: SEGMENT_DESTINATION_MIDDLEWARE,
          useValue: [{ integrationName: 'GA', middlewares: [mockMwFactory] }],
        },
      ]);

      expect(mockMwFactory).toHaveBeenCalled();
      expect(injectedValue).toBe('DI_SUCCESS');
      expect(mockBrowser.addDestinationMiddleware).toHaveBeenCalledWith(
        'GA',
        jasmine.any(Function),
      );
    });

    it('should run plugin factories in an injection context', () => {
      const mockPluginFactory = jasmine
        .createSpy('mockPluginFactory')
        .and.callFake(() => {
          const tokenVal = inject(PROOF_TOKEN);
          return { name: `Plugin_${tokenVal}` };
        });

      configureTestingModuleWith([
        { provide: SEGMENT_PLUGIN, useValue: [mockPluginFactory] },
      ]);

      expect(mockPluginFactory).toHaveBeenCalled();
      expect(mockBrowser.register).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'Plugin_DI_SUCCESS' }),
      );
    });
  });
});
