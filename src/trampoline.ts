import { ArgumentTypes } from './types';
import {
  Thunk,
  UnwrapThunk,
  isThunk,
  toThunk,
  ThunkOrValue,
} from './thunk';

export type Cont<A extends any[], R> = (...args: A) => Thunk<UnwrapThunk<R>>;

export interface Trampoline<F extends ((...args: any[]) => any)> {
  (...args: ArgumentTypes<F>): UnwrapThunk<ReturnType<F>>;
  cont: Cont<ArgumentTypes<F>, ReturnType<F>>;
}

export const trampoline = <F extends ((...args: any[]) => any)>(fn: F): Trampoline<F> => {
  const trampolineFunction = (...args: ArgumentTypes<F>): UnwrapThunk<ReturnType<F>> => {
    let result: ThunkOrValue<ReturnType<F>> = fn(...args);

    while (isThunk<ReturnType<F>>(result)) {
      result = result();
    }

    return result;
  };

  trampolineFunction.cont = (...args: ArgumentTypes<F>) => toThunk(() => fn(...args));

  return trampolineFunction;
};
