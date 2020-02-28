import { TPermissionStateFunction } from './permission-state-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TPermissionStateFactory = (window: Window, wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TPermissionStateFunction;
