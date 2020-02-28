import { patch as patchFunction, toObserver as toObserverFunction } from 'rxjs-interop';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TWrapSubscribeFunctionFactory = (
    patch: typeof patchFunction,
    toObserver: typeof toObserverFunction
) => TWrapSubscribeFunctionFunction;
