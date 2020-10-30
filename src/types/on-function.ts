import { TEventType } from './event-type';
import { TSubscribableThing } from './subscribable-thing';

export type TOnFunction = <T extends EventTarget, U extends string>(
    target: T,
    type: U,
    options?: boolean | AddEventListenerOptions
) => TSubscribableThing<TEventType<T, U>>;
