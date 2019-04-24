export type ArgumentTypes<T extends (...args: any[]) => any> =
  T extends (...args: infer A) => any
    ? A
    : never;
