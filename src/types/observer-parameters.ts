import { Observer, Subscribable } from 'rxjs-interop';

export type TObserverParameters<T> = Parameters<Subscribable<T>['subscribe']> | [Observer<T>['next']];
