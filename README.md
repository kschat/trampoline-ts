# Trampoline TS

[![Build Status](https://github.com/kschat/trampoline-ts/actions/workflows/main.yml/badge.svg)](https://github.com/kschat/trampoline-ts/actions)
[![Coverage Status](https://kschat.github.io/trampoline-ts/badges/coverage.svg)](https://github.com/kschat/trampoline-ts/actions)
[![npm version](https://badge.fury.io/js/trampoline-ts.svg)](https://badge.fury.io/js/trampoline-ts)

A type-safe way to emulate tail-call optimization with trampolines

## Install

```sh
npm i trampoline-ts
# or
yarn add trampoline-ts
# or
pnpm add trampoline-ts
```

## TypeScript Compatibility

Requires a TypeScript version >= 3.0

## Usage

```ts
import { trampoline, ThunkOrValue } from 'trampoline-ts';

const factorial = trampoline((n: number, acc: number = 1): ThunkOrValue<number> => {
  return n
    ? // Note: calling factorial.cont instead of factorial directly
      factorial.cont(n - 1, acc * n)
    : acc;
});

factorial(32768); // No stack overflow
```

## API

##### `trampoline<F extends ((...args: any[]) => ThunkOrValue<any>)>(fn: F): Trampoline<F>`

Takes a Tail Recursive Form function that returns a `ThunkOrValue<T>` and
converts it to a tail-call optimized function. The returned function
`Trampoline<F>` will have the exact same type signature as the passed
function except for one change, the return type will not contain
`ThunkOrValue<T>`, it will just be `T`.

It's important that `fn` wraps the return type in `ThunkOrValue`. If this is
omitted, TypeScript will not be able to infer the type of the returned
function and will default to `any`.

Also note that to continue function recursion `Trampoline<F>.cont()` should
be called, and not the function directly. `.cont()` has the same type
signature as the passed function, so there's no way to call it incorrectly.

##### `trampolineAsync<F extends ((...args: any[]) => ThunkOrValue<any>)>(fn: F): TrampolineAsync<F>`

Same as `trampoline`, but works with `async/Promise-returning` functions.

##### `Trampoline<F extends ((...args: any[]) => ThunkOrValue<any>>`

A function that represents a tail-call optimized function.

##### `TrampolineAsync<F extends ((...args: any[]) => ThunkOrValue<any>>`

An async function that represents a tail-call optimized function.

##### `Trampoline<F>.cont(...args: ArgumentTypes<F>): Thunk<ReturnType<F>>`

Function used to safely continue recursion. It captures `F`'s argument and
return types and thus has the same type signature.
