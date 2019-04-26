export const THUNK_SYMBOL: unique symbol = Symbol('thunk');

export interface Thunk<T> extends Function {
  __THUNK__: typeof THUNK_SYMBOL;
  (): T;
}

export type ThunkOrValue<T> = T | Thunk<T>;

export type UnwrapThunkDeep<T> = {
  0: T extends Thunk<infer U> ? UnwrapThunkDeep<U> : T;
}[
  T extends ThunkOrValue<T> ? 0 : never
];

export const isThunk = <T>(value: any): value is Thunk<T> => {
  return typeof value === 'function' && value.__THUNK__ === THUNK_SYMBOL;
};

export const toThunk = <R>(fn: () => R): Thunk<R> => {
  const thunk = () => fn();
  thunk.__THUNK__ = THUNK_SYMBOL;
  return thunk;
};
