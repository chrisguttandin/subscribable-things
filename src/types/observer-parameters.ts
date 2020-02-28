import { PartialObserver, Subscribable } from 'rxjs-interop';

// @todo Using Parameters<T> only extracts the parameters of the first overload.
export type TObserverParameters<T> = Parameters<Subscribable<T>['subscribe']> | [ PartialObserver<T>? ];
