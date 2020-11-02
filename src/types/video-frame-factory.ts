import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TVideoFrameFunction } from './video-frame-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TVideoFrameFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TVideoFrameFunction;
