import { TSubscribableThing } from './subscribable-thing';
import { TSubscribeFunction } from './subscribe-function';

export type TWrapSubscribeFunctionFunction = <T>(innerSubscribe: TSubscribeFunction<T>) => TSubscribableThing<T>;
