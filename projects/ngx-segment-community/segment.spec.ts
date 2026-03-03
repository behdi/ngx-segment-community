import { TestBed } from '@angular/core/testing';
import { SegmentClient } from './client';
import { provideSegmentAnalytics, withSettings } from './provider';
import { SegmentService } from './segment';

describe('SegmentService', () => {
  let service: SegmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideSegmentAnalytics(withSettings({ writeKey: 'TEST_WRITE_KEY' })),
        {
          provide: SegmentClient,
          useValue: {
            initialize: jasmine.createSpy('initialize').and.resolveTo(),
          } satisfies Partial<SegmentClient>,
        },
      ],
    });
    service = TestBed.inject(SegmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
