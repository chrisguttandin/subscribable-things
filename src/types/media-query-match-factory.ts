import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TMediaQueryMatchFunction } from './media-query-match-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMediaQueryMatchFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TMediaQueryMatchFunction;
