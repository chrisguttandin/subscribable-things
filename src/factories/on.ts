import { TEventHandler, TEventType, TOnFactory } from '../types';

export const createOn: TOnFactory = (wrapSubscribeFunction) => {
    return (target, type, options) =>
        wrapSubscribeFunction((observer) => {
            const listener: TEventHandler<typeof target> = (event) => observer.next(<TEventType<typeof target, typeof type>>event);

            target.addEventListener(type, listener, options);

            return () => target.removeEventListener(type, listener, options);
        });
};
