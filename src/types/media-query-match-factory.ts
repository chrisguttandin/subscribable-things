import { TMediaQueryMatchFunction } from './media-query-match-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMediaQueryMatchFactory = (window: Window, wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TMediaQueryMatchFunction;
