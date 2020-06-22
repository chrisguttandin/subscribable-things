import { TMutationsFactory } from '../types';

export const createMutations: TMutationsFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (htmlElement, options) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.MutationObserver === undefined) {
                return emitNotSupportedError(observer);
            }

            const mutationObserver = new window.MutationObserver((records) => observer.next(records));

            try {
                mutationObserver.observe(htmlElement, options);
            } catch (err) {
                observer.error(err);
            }

            return () => mutationObserver.disconnect();
        });
};
