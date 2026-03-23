import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  ResolveFn,
  RouterFeatures,
  Routes,
  withRouterConfig,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideSegmentAnalytics, SegmentService } from 'ngx-segment-community';
import { withAutomaticPageTracking } from './auto-page-tracker';
import { SegmentRouterData, SegmentRouterIgnore } from './router-data';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class DummyComponent {}

interface SetupResult {
  harness: RouterTestingHarness;
  mockSegmentService: jasmine.SpyObj<SegmentService>;
}

const setUpTrackingModule = async (
  routes: Routes,
  ...routerFeatures: RouterFeatures[]
): Promise<SetupResult> => {
  const mockSegmentService: jasmine.SpyObj<SegmentService> =
    jasmine.createSpyObj<SegmentService>('SegmentService', ['page']);
  mockSegmentService.page.and.resolveTo();

  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes, ...routerFeatures),
      provideSegmentAnalytics(
        { writeKey: 'SOME_KEY' },
        withAutomaticPageTracking(),
      ),
      // Use the mock after the main provider function to make sure it actually subs it out
      { provide: SegmentService, useValue: mockSegmentService },
    ],
  });

  return { mockSegmentService, harness: await RouterTestingHarness.create() };
};

describe('withAutomaticPageTracking', () => {
  beforeEach(() => {
    spyOn(console, 'warn');
  });

  it('should track a basic page view using the native route title', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'home',
        component: DummyComponent,
        title: 'Home Page', // Native Angular Title fallback
      },
    ]);

    await harness.navigateByUrl('/home');

    expect(mockSegmentService.page).toHaveBeenCalledWith(
      'Home Page',
      undefined,
      undefined,
    );
  });

  it('should track a page using SegmentRouterData (Name and Properties)', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'checkout',
        component: DummyComponent,
        data: {
          // Arbitrary key to prove instanceof hunting works
          myArbitraryKey: new SegmentRouterData('Checkout', { step: 1 }),
        },
      },
    ]);

    await harness.navigateByUrl('/checkout');

    expect(mockSegmentService.page).toHaveBeenCalledWith(
      'Checkout',
      undefined,
      { step: 1 },
    );
  });

  it('should track a page using SegmentRouterData (Category, Name, and Properties)', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'store',
        component: DummyComponent,
        data: {
          // Category, Name, and Properties
          segmentInfo: new SegmentRouterData('Store', 'Product View', {
            item: 'Coffee',
          }),
        },
      },
    ]);

    await harness.navigateByUrl('/store');

    expect(mockSegmentService.page).toHaveBeenCalledWith(
      'Store',
      'Product View',
      { item: 'Coffee' },
    );
  });

  it('should log a warning and abort if no category, name, or title exists', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'empty',
        component: DummyComponent,
        // No title, no SegmentRouterData
      },
    ]);

    await harness.navigateByUrl('/empty');

    expect(mockSegmentService.page).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      jasmine.stringMatching(/Cannot track page event/i),
    );
  });

  describe('Hybrid Edge Cases (Native Title + SegmentRouterData)', () => {
    // EDGE CASE 1: Native Title + Properties Only
    it('should combine Native Title with Segment properties', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'hybrid-props',
          component: DummyComponent,
          title: 'Native Cart Title',
          data: {
            segment: new SegmentRouterData({ checkoutStep: 2 }),
          },
        },
      ]);

      await harness.navigateByUrl('/hybrid-props');

      expect(mockSegmentService.page).toHaveBeenCalledWith(
        'Native Cart Title',
        undefined,
        { checkoutStep: 2 },
      );
    });

    // EDGE CASE 2: Native Title + Overriding Name
    it('should completely override the Native Title if SegmentRouterData provides a name', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'hybrid-override',
          component: DummyComponent,
          title: 'Ugly SEO Title - Do Not Track',
          data: {
            segment: new SegmentRouterData('Clean Analytics Name', {
              source: 'banner',
            }),
          },
        },
      ]);

      await harness.navigateByUrl('/hybrid-override');

      expect(mockSegmentService.page).toHaveBeenCalledWith(
        'Clean Analytics Name',
        undefined,
        { source: 'banner' },
      );
    });
  });

  describe('Empty String Edge Cases', () => {
    // EDGE CASE 3: Native title, but empty string as title override
    it('should abort tracking if the developer explicitly passes an empty string for the name', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'empty-name',
          component: DummyComponent,
          title: 'Valid Native Title',
          data: {
            segment: new SegmentRouterData('', { source: 'test' }),
          },
        },
      ]);

      await harness.navigateByUrl('/empty-name');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/Cannot track page event/i),
      );
    });

    // EDGE CASE 4: Empty string as category, but a valid name
    it('should respect an explicitly empty category, abort tracking, and log a generic warning', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'empty-category-valid-name',
          component: DummyComponent,
          data: {
            segment: new SegmentRouterData('', 'Valid Name', {
              source: 'test',
            }),
          },
        },
      ]);

      await harness.navigateByUrl('/empty-category-valid-name');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/evaluates to an empty string/i),
      );
    });

    // EDGE CASE 5: Double empty strings
    it('should abort tracking if both category and name are explicitly empty strings', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'double-empty',
          component: DummyComponent,
          data: {
            segment: new SegmentRouterData('', '', { source: 'garbage' }),
          },
        },
      ]);

      await harness.navigateByUrl('/double-empty');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/evaluates to an empty string/i),
      );
    });
  });

  describe('Nested Routes & Leaf Node Isolation', () => {
    // EDGE CASE 6: Deeply Nested Routes (Proving isolation and leaf-node targeting)
    it('should drill down to the leaf node and ignore parent route data', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'parent',
          component: DummyComponent,
          data: {
            parentData: new SegmentRouterData('Parent View', { level: 1 }),
          },
          children: [
            {
              path: 'child',
              component: DummyComponent,
              data: {
                childData: new SegmentRouterData('Child View', { level: 2 }),
              },
            },
          ],
        },
      ]);

      await harness.navigateByUrl('/parent/child');

      expect(mockSegmentService.page).toHaveBeenCalledTimes(1);
      expect(mockSegmentService.page).toHaveBeenCalledWith(
        'Child View',
        undefined,
        { level: 2 },
      );
    });
  });

  describe('Angular Default Data Inheritance (emptyOnly)', () => {
    // EDGE CASE 7: Inherits because the CHILD has an empty path (paramsInheritanceStrategy: 'emptyOnly' Rule 1)
    it('should track inherited data when the child route has an empty path', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'parent-with-component',
          component: DummyComponent,
          data: {
            segment: new SegmentRouterData('Parent Data', {
              rule: 'empty-child-path',
            }),
          },
          children: [
            {
              // Empty child path to inherit parent data
              path: '',
              component: DummyComponent,
            },
          ],
        },
      ]);

      await harness.navigateByUrl('/parent-with-component');

      expect(mockSegmentService.page).toHaveBeenCalledTimes(1);
      expect(mockSegmentService.page).toHaveBeenCalledWith(
        'Parent Data',
        undefined,
        { rule: 'empty-child-path' },
      );
    });

    // EDGE CASE 8: Inherits because the PARENT has no component (paramsInheritanceStrategy: 'emptyOnly' Rule 2)
    it('should track inherited data when the parent route has no component set', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'componentless-parent',
          data: {
            segment: new SegmentRouterData('Componentless Data', {
              rule: 'no-parent-component',
            }),
          },
          children: [
            {
              path: 'standard-child',
              component: DummyComponent, // Inherits from the component-less parent
            },
          ],
        },
      ]);

      await harness.navigateByUrl('/componentless-parent/standard-child');

      expect(mockSegmentService.page).toHaveBeenCalledTimes(1);
      expect(mockSegmentService.page).toHaveBeenCalledWith(
        'Componentless Data',
        undefined,
        { rule: 'no-parent-component' },
      );
    });
  });

  describe('Multiple Instance Protection (Standard Routing)', () => {
    // EDGE CASE 9: The "Insane Developer" (Multiple instances manually defined on a single route)
    it('should abort tracking if a developer manually provides multiple SegmentRouterData instances on a single route', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'multiple-manual-instances',
          component: DummyComponent,
          data: {
            segmentOne: new SegmentRouterData('First Attempt'),
            segmentTwo: new SegmentRouterData('Second Attempt'),
          },
        },
      ]);

      await harness.navigateByUrl('/multiple-manual-instances');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/Multiple SegmentRouterData instances found/i),
      );
    });
  });

  describe('Dynamic Route Resolvers', () => {
    it('should successfully track a page using dynamically resolved SegmentRouterData', async () => {
      const dynamicDataResolver: ResolveFn<SegmentRouterData> = () => {
        // In a real app, this would be adjusted to use results from a previous resolvers, or an http call.
        return new SegmentRouterData('Resolved Category', 'Resolved Name', {
          resolvedId: 42,
        });
      };

      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'dynamic-data',
          component: DummyComponent,
          resolve: {
            dynamicSegment: dynamicDataResolver,
          },
        },
      ]);

      await harness.navigateByUrl('/dynamic-data');

      expect(mockSegmentService.page).toHaveBeenCalledOnceWith(
        'Resolved Category',
        'Resolved Name',
        { resolvedId: 42 },
      );
    });
  });
});

describe('withAutomaticPageTracking - paramsInheritanceStrategy: "always"', () => {
  beforeEach(() => {
    spyOn(console, 'warn');
  });

  it('should abort tracking and log a severe warning if multiple SegmentRouterData instances are found', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule(
      [
        {
          path: 'parent',
          data: { parentSegment: new SegmentRouterData('Parent View') },
          children: [
            {
              path: 'child',
              component: DummyComponent,
              data: {
                childSegment: new SegmentRouterData('Child View'),
              },
            },
          ],
        },
      ],
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    );

    await harness.navigateByUrl('/parent/child');

    expect(console.warn).toHaveBeenCalledWith(
      jasmine.stringMatching(/Multiple SegmentRouterData instances found/i),
    );
    expect(mockSegmentService.page).not.toHaveBeenCalled();
  });

  it('should silence a child route if the parent has SegmentRouterIgnore, because "always" forces the child to inherit the flag', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule(
      [
        {
          path: 'ignore-parent',
          data: { ignore: new SegmentRouterIgnore() }, // cascade: false
          children: [
            {
              path: 'child',
              component: DummyComponent,
              data: {
                segment: new SegmentRouterData(
                  'I will be silenced by inheritance',
                ),
              },
            },
          ],
        },
      ],
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    );

    await harness.navigateByUrl('/ignore-parent/child');

    expect(mockSegmentService.page).not.toHaveBeenCalled();
  });
});

describe('SegmentRouterIgnore (The Kill Switch)', () => {
  // CASE 1: Basic leaf node ignore
  it('should completely ignore a leaf route that provides SegmentRouterIgnore', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'ignore-leaf',
        component: DummyComponent,
        title: 'Should Not Track',
        data: {
          ignore: new SegmentRouterIgnore(),
        },
      },
    ]);

    await harness.navigateByUrl('/ignore-leaf');

    expect(mockSegmentService.page).not.toHaveBeenCalled();
  });

  // CASE 2: The Collision (ignore & track on the exact same route)
  it('should prioritize SegmentRouterIgnore if a route accidentally provides BOTH Ignore and Data', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'ignore-collision',
        component: DummyComponent,
        data: {
          segment: new SegmentRouterData('Track Me Please'),
          ignore: new SegmentRouterIgnore(), // The kill switch must win
        },
      },
    ]);

    await harness.navigateByUrl('/ignore-collision');

    expect(mockSegmentService.page).not.toHaveBeenCalled();
  });

  // CASE 3: Parent ignore WITHOUT cascade (Child should track successfully)
  it('should track the child route if the parent has SegmentRouterIgnore WITHOUT cascade', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'parent-no-cascade',
        component: DummyComponent,
        data: {
          ignore: new SegmentRouterIgnore(),
        },
        children: [
          {
            path: 'child',
            component: DummyComponent,
            data: {
              segment: new SegmentRouterData('Safe Child View'),
            },
          },
        ],
      },
    ]);

    await harness.navigateByUrl('/parent-no-cascade/child');

    expect(mockSegmentService.page).toHaveBeenCalledOnceWith(
      'Safe Child View',
      undefined,
      undefined,
    );
  });

  // CASE 4: Parent ignore WITH cascade (child must be silenced)
  it('should SILENCE the child route if the parent has SegmentRouterIgnore WITH cascade', async () => {
    const { harness, mockSegmentService } = await setUpTrackingModule([
      {
        path: 'parent-cascade',
        data: {
          ignore: new SegmentRouterIgnore({ cascade: true }),
        },
        children: [
          {
            path: 'child',
            component: DummyComponent,
            data: {
              segment: new SegmentRouterData('Doomed Child View'),
            },
          },
        ],
      },
    ]);

    await harness.navigateByUrl('/parent-cascade/child');

    expect(mockSegmentService.page).not.toHaveBeenCalled();
  });

  describe('Lazy Loaded Boundaries', () => {
    // CASE 5: Lazy loaded tracking (baseline proof that lazy routes work)
    it('should successfully track a lazy-loaded route (baseline check)', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'lazy-standard',
          loadChildren: () =>
            Promise.resolve([
              {
                path: 'child',
                component: DummyComponent,
                data: { segment: new SegmentRouterData('Lazy Child View') },
              },
            ]),
        },
      ]);

      await harness.navigateByUrl('/lazy-standard/child');

      expect(mockSegmentService.page).toHaveBeenCalledOnceWith(
        'Lazy Child View',
        undefined,
        undefined,
      );
    });

    // CASE 6: Lazy loaded child under a cascading parent
    it('should SILENCE a lazy-loaded child if the eager parent has cascade: true', async () => {
      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'lazy-cascade',
          data: {
            ignore: new SegmentRouterIgnore({ cascade: true }),
          },
          loadChildren: () =>
            Promise.resolve([
              {
                path: 'child',
                component: DummyComponent,
                data: {
                  segment: new SegmentRouterData('Doomed Lazy Child View'),
                },
              },
            ]),
        },
      ]);

      await harness.navigateByUrl('/lazy-cascade/child');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
    });
  });

  describe('Dynamic Route Resolvers', () => {
    it('should completely silence tracking if a resolver dynamically returns a SegmentRouterIgnore kill switch', async () => {
      const dynamicIgnoreResolver: ResolveFn<SegmentRouterIgnore> = () => {
        return new SegmentRouterIgnore();
      };

      const { harness, mockSegmentService } = await setUpTrackingModule([
        {
          path: 'dynamic-ignore',
          component: DummyComponent,
          resolve: {
            abortTracking: dynamicIgnoreResolver,
          },
        },
      ]);

      await harness.navigateByUrl('/dynamic-ignore');

      expect(mockSegmentService.page).not.toHaveBeenCalled();
    });
  });
});
