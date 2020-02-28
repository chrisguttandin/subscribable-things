import { Observer } from 'rxjs-interop';
import { TOptionalUnsubscribeFunction } from './optional-unsubscribe-function';

export type TSubscribeFunction<T> = (observer: Observer<T>) => TOptionalUnsubscribeFunction;
