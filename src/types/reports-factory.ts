import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TReportsFunction } from './reports-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TReportsFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TReportsFunction;
