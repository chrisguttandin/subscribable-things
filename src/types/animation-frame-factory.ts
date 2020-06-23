import { TAnimationFrameFunction } from './animation-frame-function';
import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TAnimationFrameFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TAnimationFrameFunction;
