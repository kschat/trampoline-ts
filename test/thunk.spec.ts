import { assert as typeAssert, IsExact } from 'conditional-type-checks';
import {
  isThunk,
  toThunk,
  THUNK_SYMBOL,
  UnwrapThunk,
  Thunk,
  ThunkOrValue,
} from '../src/thunk';

describe('thunk', () => {
  describe('isThunk(value)', () => {
    it('returns true if the value is a thunk created by this lib', () => {
      expect(isThunk(toThunk(() => null))).toBe(true);
    });

    it('returns false if the value is not a thunk', () => {
      expect(isThunk(() => null)).toBe(false);
      expect(isThunk(true)).toBe(false);
      expect(isThunk(1)).toBe(false);
      expect(isThunk('')).toBe(false);
    });
  });

  describe('toThunk', () => {
    it('converts a thunk-like function to a thunk', () => {
      const thunk = toThunk(() => 'some value');
      expect(thunk).toHaveProperty('__THUNK__', THUNK_SYMBOL);
      expect(thunk()).toBe('some value');
    });
  });

  describe('UnwrapThunk<T>', () => {
    it('removes recursively removes all instances of Thunk<T> from T', () => {
      typeAssert<IsExact<UnwrapThunk<1>, 1>>(true);
      typeAssert<IsExact<UnwrapThunk<Thunk<1>>, 1>>(true);
      typeAssert<IsExact<UnwrapThunk<ThunkOrValue<1>>, 1>>(true);
      typeAssert<IsExact<UnwrapThunk<ThunkOrValue<Thunk<1>>>, 1>>(true);
      typeAssert<IsExact<UnwrapThunk<ThunkOrValue<ThunkOrValue<1> | ThunkOrValue<2>>>, 1 | 2>>(true);
      typeAssert<IsExact<UnwrapThunk<Thunk<1 | Thunk<2>>>, 1 | 2>>(true);
      typeAssert<IsExact<UnwrapThunk<Thunk<1 | Thunk<2> | ThunkOrValue<3>>>, 1 | 2 | 3>>(true);
    });
  });
});
