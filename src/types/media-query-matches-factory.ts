import { TMediaQueryMatchesFunction } from './media-query-matches-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

export type TMediaQueryMatchesFactory = (
    window: Window,
    wrapSubscribeFunction: TWrapSubscribeFunctionFunction
) => TMediaQueryMatchesFunction;
