import { SegmentRouterData, SegmentRouterIgnore } from './router-data';

describe('SegmentRouterData', () => {
  describe('Overload 1: Properties only', () => {
    it('should assign properties and leave name/category undefined', () => {
      const props = { revenue: 50.0, currency: 'USD' };

      const data = new SegmentRouterData(props);

      expect(data.category).toBeUndefined();
      expect(data.name).toBeUndefined();
      expect(data.properties).toEqual(props);
    });
  });

  describe('Overload 2: Name and Optional Properties', () => {
    it('should assign name and properties, leaving category undefined', () => {
      const props = { fromBanner: true };
      const data = new SegmentRouterData('Checkout', props);

      expect(data.category).toBeUndefined();
      expect(data.name).toBe('Checkout');
      expect(data.properties).toEqual(props);
    });

    it('should handle omitted properties gracefully', () => {
      const data = new SegmentRouterData('Home');

      expect(data.category).toBeUndefined();
      expect(data.name).toBe('Home');
      expect(data.properties).toBeUndefined();
    });
  });

  describe('Overload 3: Category, Name, and Optional Properties', () => {
    it('should assign all three parameters correctly', () => {
      const props = { step: 1 };
      const data = new SegmentRouterData('Store', 'Cart', props);

      expect(data.category).toBe('Store');
      expect(data.name).toBe('Cart');
      expect(data.properties).toEqual(props);
    });

    it('should handle omitted properties gracefully when category and name are provided', () => {
      const data = new SegmentRouterData('Store', 'Cart');

      expect(data.category).toBe('Store');
      expect(data.name).toBe('Cart');
      expect(data.properties).toBeUndefined();
    });
  });
});

describe('SegmentRouterIgnore', () => {
  it('should default cascade to false if no config is provided', () => {
    const ignore = new SegmentRouterIgnore();
    expect(ignore.cascade).toBeFalse();
  });

  it('should default cascade to false if an empty config object is provided', () => {
    const ignore = new SegmentRouterIgnore({});
    expect(ignore.cascade).toBeFalse();
  });

  it('should strictly assign cascade based on the provided config', () => {
    const cascadingIgnore = new SegmentRouterIgnore({ cascade: true });
    expect(cascadingIgnore.cascade).toBeTrue();

    const strictIgnore = new SegmentRouterIgnore({ cascade: false });
    expect(strictIgnore.cascade).toBeFalse();
  });
});
