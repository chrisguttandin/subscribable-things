import { TMidiOutputsFunction } from './midi-outputs-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMidiOutputsFactory = (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TMidiOutputsFunction;
