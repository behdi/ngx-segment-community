import type { EnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SegmentClient } from './client';
import {
  provideSegmentAnalytics,
  SEGMENT_ANALYTICS_SETTINGS,
  SEGMENT_DESTINATION_MIDDLEWARE,
  SEGMENT_PLUGIN,
  SEGMENT_SOURCE_MIDDLEWARE,
  withDestinationMiddlewares,
  withPlugins,
  withSourceMiddlewares,
  type SegmentDestinationMiddlewareFn,
  type SegmentPluginFn,
  type SegmentSourceMiddlewareFn,
} from './provider';
import { SegmentService } from './segment';

describe('Segment Providers', () => {
  const mockSegmentClient = {
    initialize: jasmine.createSpy('initialize').and.resolveTo(),
  } satisfies Partial<SegmentClient>;

  const configureTestingModuleWith = (providers: EnvironmentProviders[]) => {
    TestBed.configureTestingModule({
      providers: [
        ...providers,
        { provide: SegmentClient, useValue: mockSegmentClient },
      ],
    });
  };

  describe('provideSegmentAnalytics', () => {
    it('should provide the SegmentService as a singleton', () => {
      configureTestingModuleWith([
        provideSegmentAnalytics({ writeKey: 'TEST_KEY' }),
      ]);

      const service1 = TestBed.inject(SegmentService);
      const service2 = TestBed.inject(SegmentService);

      expect(service1).toBeTruthy();
      expect(service1).toBe(service2); // Proves it's a singleton
    });

    it('should successfully provide the settings token', () => {
      const mockSettings = {
        writeKey: 'TEST_KEY',
        debug: true,
        disable: false,
        initializationMode: 'manual' as const,
      };

      configureTestingModuleWith([provideSegmentAnalytics(mockSettings)]);

      const settings = TestBed.inject(SEGMENT_ANALYTICS_SETTINGS);

      expect(settings).toEqual(mockSettings);
    });
  });

  describe('withSourceMiddlewares', () => {
    it('should flatten and provide multiple middleware factories correctly', () => {
      const mockMw1: SegmentSourceMiddlewareFn =
        () =>
        ({ payload, next }) =>
          next(payload);
      const mockMw2: SegmentSourceMiddlewareFn =
        () =>
        ({ payload, next }) =>
          next(payload);
      const mockMw3: SegmentSourceMiddlewareFn =
        () =>
        ({ payload, next }) =>
          next(payload);

      configureTestingModuleWith([
        provideSegmentAnalytics(
          { writeKey: 'TEST' },
          withSourceMiddlewares([mockMw1, mockMw2]),
          withSourceMiddlewares([mockMw3]),
        ),
      ]);

      const middlewares = TestBed.inject(SEGMENT_SOURCE_MIDDLEWARE);

      expect(Array.isArray(middlewares)).toBeTrue();
      expect(middlewares.length).toBe(3);
      // Ensure the exact references match, may sound useless but it ensures integrity
      expect(middlewares[0]).toBe(mockMw1);
      expect(middlewares[1]).toBe(mockMw2);
      expect(middlewares[2]).toBe(mockMw3);
    });

    it('should be null if no source middlewares are provided', () => {
      configureTestingModuleWith([
        provideSegmentAnalytics({ writeKey: 'TEST' }),
      ]);

      const middlewares = TestBed.inject(SEGMENT_SOURCE_MIDDLEWARE, undefined, {
        optional: true,
      });
      expect(middlewares).toBeNull();
    });
  });

  describe('withDestinationMiddlewares', () => {
    it('should map and provide destination middlewares correctly', () => {
      const mockDestMw: SegmentDestinationMiddlewareFn = {
        integrationName: 'Google Analytics',
        middlewares: [
          () =>
            ({ payload, next }) =>
              next(payload),
        ],
      };

      configureTestingModuleWith([
        provideSegmentAnalytics(
          { writeKey: 'TEST' },
          withDestinationMiddlewares([mockDestMw]),
        ),
      ]);

      const middlewares = TestBed.inject(SEGMENT_DESTINATION_MIDDLEWARE);

      expect(Array.isArray(middlewares)).toBeTrue();
      expect(middlewares.length).toBe(1);
      expect(middlewares[0]?.integrationName).toBe('Google Analytics');
      expect(middlewares[0]?.middlewares.length).toBe(1);
    });
  });

  describe('withPlugins', () => {
    it('should flatten and provide multiple plugin factories correctly', () => {
      const mockPlugin1: SegmentPluginFn = () => ({
        name: 'A',
        type: 'enrichment',
        version: '1',
        isLoaded: () => true,
        load: () => Promise.resolve(),
      });
      const mockPlugin2: SegmentPluginFn = () => ({
        name: 'B',
        type: 'destination',
        version: '1',
        isLoaded: () => true,
        load: () => Promise.resolve(),
      });

      configureTestingModuleWith([
        provideSegmentAnalytics(
          { writeKey: 'TEST' },
          withPlugins([mockPlugin1]),
          withPlugins([mockPlugin2]),
        ),
      ]);

      const plugins = TestBed.inject(SEGMENT_PLUGIN);

      expect(Array.isArray(plugins)).toBeTrue();
      expect(plugins.length).toBe(2);
      expect(plugins[0]?.().name).toBe('A');
      expect(plugins[1]?.().name).toBe('B');
    });

    it('should be null if no plugins are provided', () => {
      configureTestingModuleWith([
        provideSegmentAnalytics({ writeKey: 'TEST' }),
      ]);

      const plugins = TestBed.inject(SEGMENT_PLUGIN, undefined, {
        optional: true,
      });
      expect(plugins).toBeNull();
    });
  });
});
