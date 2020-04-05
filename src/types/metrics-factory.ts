import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TMetricsFunction } from './metrics-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMetricsFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TMetricsFunction;
