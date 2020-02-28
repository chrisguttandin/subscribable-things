import { TMutationsFunction } from './mutations-function';
import { TWindow } from './window';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMutationsFactory = (window: TWindow, wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TMutationsFunction;
