import { assert as typeAssert, IsExact, Has } from 'conditional-type-checks';
import { trampoline, isThunk, ThunkOrValue } from '../src';
import { ArgumentTypes } from '../src/types';

describe('trampoline', () => {
  describe('trampoline(fn)', () => {
    it('returns a tail call recursive function', () => {
      expect(trampoline(() => true)).toBeInstanceOf(Function);
    });

    it('preserves argument types in the returned function', () => {
      const impl = (_1: number, _2: string, _3: boolean) => true;
      const fn = trampoline(impl);

      // tslint:disable-next-line:ban-types
      typeAssert<Has<typeof fn, Function>>(true);
      typeAssert<IsExact<ArgumentTypes<typeof fn>, [number, string, boolean]>>(true);
    });

    it('preserves return type in the returned function', () => {
      const impl = () => true;
      const fn = trampoline(impl);

      // tslint:disable-next-line:ban-types
      typeAssert<Has<typeof fn, Function>>(true);
      typeAssert<IsExact<ReturnType<typeof fn>, boolean>>(true);
    });

    it('removes "ThunkOrValue" from the returned functions return type', () => {
      const impl = (): ThunkOrValue<boolean> => true;
      const fn = trampoline(impl);

      // tslint:disable-next-line:ban-types
      typeAssert<Has<typeof fn, Function>>(true);
      typeAssert<IsExact<ReturnType<typeof fn>, boolean>>(true);
    });

    it('preserves argument types in "cont"', () => {
      const impl = (_1: number, _2: string, _3: boolean) => true;
      const { cont } = trampoline(impl);

      // tslint:disable-next-line:ban-types
      typeAssert<Has<typeof cont, Function>>(true);
      typeAssert<IsExact<ArgumentTypes<typeof cont>, [number, string, boolean]>>(true);
    });

    it('preserves return type in "cont" returned thunk', () => {
      const impl = () => true;
      const { cont } = trampoline(impl);
      const thunk = cont();

      // tslint:disable-next-line:ban-types
      typeAssert<Has<typeof cont, Function>>(true);
      typeAssert<Has<ReturnType<typeof thunk>, boolean>>(true);
    });

    it('returns a function with a thunk returning "cont" method', () => {
      const fn = jest.fn((input: string) => `${input}!`);
      const { cont } = trampoline(fn);
      const thunk = cont('input');

      expect(isThunk(thunk)).toBe(true);
      expect(fn).not.toHaveBeenCalled();
      expect(thunk()).toBe('input!');
      expect(fn).toHaveBeenNthCalledWith(1, 'input');
    });

    it(`loops until the passed function doesn't return a thunk`, () => {
      const timesToLoop = 5;
      const fn = trampoline((times: number = 0): ThunkOrValue<number> => {
        return times < timesToLoop ? fn.cont(times + 1) : times;
      });

      const contSpy = jest.spyOn(fn, 'cont');
      fn();
      expect(contSpy).toHaveBeenCalledTimes(5);
    });

    it(`doesn't throw a stack overflow error`, () => {
      const brokenFactorial = (n: number, acc: number = 1): number => {
        return n ? brokenFactorial(n - 1, acc * n) : acc;
      };

      const factorial = trampoline((n: number, acc: number = 1): ThunkOrValue<number> => {
        return n
          ? factorial.cont(n - 1, acc * n)
          : acc;
      });

      expect(() => brokenFactorial(32768)).toThrowError('Maximum call stack size exceeded');
      expect(factorial(32768)).toEqual(Infinity);
    });

    it('supports returning functions', () => {
      const fn = trampoline((): ThunkOrValue<() => string> => {
        return () => 'hello';
      });

      expect(fn()).toBeInstanceOf(Function);
      expect(fn()()).toBe('hello');
    });
  });
});
