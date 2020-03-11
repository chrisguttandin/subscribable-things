import { TMidiInputsFunction } from './midi-inputs-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMidiInputsFactory = (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TMidiInputsFunction;
