import { TOnFunction } from './on-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TOnFactory = (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TOnFunction;
