import { TEventHandler } from './event-handler';

export type TEventTargetWithPropertyHandler<T extends EventTarget, U extends string, V extends Event> = {
    [P in U as `on${P}`]: null | TEventHandler<T, V>;
};
