import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TMediaDevicesFunction } from './media-devices-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMediaDevicesFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TMediaDevicesFunction;
