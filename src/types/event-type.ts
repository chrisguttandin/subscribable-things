import { TEventTargetWithPropertyHandler } from './event-target-with-property-handler';

export type TEventType<T extends EventTarget, U extends string> = T extends TEventTargetWithPropertyHandler<T, U, infer V> ? V : Event;
