import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TWakeLockFunction } from './wake-lock-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TWakeLockFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TWakeLockFunction;
