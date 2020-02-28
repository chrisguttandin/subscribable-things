import { TMutationsFactory } from '../types';

export const createMutations: TMutationsFactory = (window, wrapSubscribeFunction) => {
    return (htmlElement, options) => wrapSubscribeFunction((observer) => {
        const mutationObserver = new window.MutationObserver((records) => observer.next(records));

        try {
            mutationObserver.observe(htmlElement, options);
        } catch (err) {
            observer.error(err);
        }

        return () => mutationObserver.disconnect();
    });
};
