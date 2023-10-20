import { ArgumentTypes } from './types';
import { Thunk, UnwrapThunkDeep, isThunk, toThunk, ThunkOrValue } from './thunk';

export type UnwrapPromise<T> = T extends Promise<infer U> ? Exclude<U, Promise<T>> : T;

export type Unbox<T> = UnwrapThunkDeep<UnwrapPromise<T>>;

export type Cont<A extends any[], R> = (...args: A) => Thunk<Unbox<R>>;

export interface Trampoline<F extends (...args: any[]) => any> {
  (...args: ArgumentTypes<F>): Unbox<ReturnType<F>>;
  cont: Cont<ArgumentTypes<F>, ReturnType<F>>;
}

export interface TrampolineAsync<F extends (...args: any[]) => any> {
  (...args: ArgumentTypes<F>): Promise<Unbox<ReturnType<F>>>;
  cont: Cont<ArgumentTypes<F>, ReturnType<F>>;
}

export const trampoline = <F extends (...args: any[]) => any>(fn: F): Trampoline<F> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const cont = (...args: ArgumentTypes<F>) => toThunk(() => fn(...args));

  return Object.assign(
    (...args: ArgumentTypes<F>): Unbox<ReturnType<F>> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let result: ThunkOrValue<ReturnType<F>> = fn(...args);

      while (isThunk<ReturnType<F>>(result)) {
        result = result();
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    },
    { cont },
  );
};

export const trampolineAsync = <F extends (...args: any[]) => any>(fn: F): TrampolineAsync<F> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const cont = (...args: ArgumentTypes<F>) => toThunk(() => fn(...args));

  return Object.assign(
    async (...args: ArgumentTypes<F>): Promise<Unbox<ReturnType<F>>> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let result: ThunkOrValue<Promise<ReturnType<F>>> = await fn(...args);

      while (isThunk(result)) {
        result = await result();
      }

      return result;
    },
    { cont },
  );
};
