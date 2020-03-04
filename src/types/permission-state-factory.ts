import { TEmitNotSupportedErrorFunction } from './emit-not-supported-error-function';
import { TPermissionStateFunction } from './permission-state-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TPermissionStateFactory = (
    emitNotSupportedError: TEmitNotSupportedErrorFunction,
    window: null | TWindow,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TPermissionStateFunction;
