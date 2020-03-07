import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TResizesFunction } from './resizes-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TResizesFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TResizesFunction;
