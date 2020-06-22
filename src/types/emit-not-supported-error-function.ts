import { Observer } from 'rxjs-interop';
import { TUnsubscribeFunction } from './unsubscribe-function';

export type TEmitNotSupportedErrorFunction = (observer: Observer<any>) => TUnsubscribeFunction;
