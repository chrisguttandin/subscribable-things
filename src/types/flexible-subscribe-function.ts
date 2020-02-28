import { TObserverParameters } from './observer-parameters';
import { TUnsubscribeFunction } from './unsubscribe-function';

export type TFlexibleSubscribeFunction<T> = (...args: TObserverParameters<T>) => TUnsubscribeFunction;
