import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TIntersectionsFunction } from './intersections-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TIntersectionsFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TIntersectionsFunction;
