import { InteropObservable } from 'rxjs-interop';
import { TFlexibleSubscribeFunction } from './flexible-subscribe-function';

export type TSubscribableThing<T> = InteropObservable<T> & TFlexibleSubscribeFunction<T>;
