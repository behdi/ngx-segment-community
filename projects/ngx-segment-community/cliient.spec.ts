import { TestBed } from '@angular/core/testing';
import { SegmentClient } from './client';
import { provideSegmentAnalytics, withSettings } from './provider';

describe('SegmentClient', () => {
  let service: SegmentClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideSegmentAnalytics(withSettings({ writeKey: 'TEST' })),
        {
          provide: SegmentClient,
          useValue: {
            initialize: jasmine.createSpy('initialize').and.resolveTo(),
          } satisfies Partial<SegmentClient>,
        },
      ],
    });
    service = TestBed.inject(SegmentClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
