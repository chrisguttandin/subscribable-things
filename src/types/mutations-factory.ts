import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TMutationsFunction } from './mutations-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMutationsFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TMutationsFunction;
