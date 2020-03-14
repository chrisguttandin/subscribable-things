import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TUnhandledRejectionFunction } from './unhandled-rejection-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TUnhandledRejectionFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TUnhandledRejectionFunction;
