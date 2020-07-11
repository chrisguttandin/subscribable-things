import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TOnlineFunction } from './online-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TOnlineFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TOnlineFunction;
