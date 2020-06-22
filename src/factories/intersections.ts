import { TIntersectionsFactory } from '../types';

export const createIntersections: TIntersectionsFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (htmlElement, options) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.IntersectionObserver === undefined) {
                return emitNotSupportedError(observer);
            }

            const intersectionObserverObserver = new window.IntersectionObserver((entries) => observer.next(entries), options);

            try {
                intersectionObserverObserver.observe(htmlElement);
            } catch (err) {
                observer.error(err);
            }

            return () => intersectionObserverObserver.disconnect();
        });
};
