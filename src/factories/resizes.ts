import { IResizeObserverEntry } from '../interfaces';
import { TResizesFactory } from '../types';

export const createResizes: TResizesFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (htmlElement, options) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.ResizeObserver === undefined) {
                return emitNotSupportedError(observer);
            }

            const resizeObserver = new window.ResizeObserver((entries) => observer.next(<IResizeObserverEntry[]>entries));

            try {
                resizeObserver.observe(htmlElement, options);
            } catch (err) {
                observer.error(err);
            }

            return () => resizeObserver.disconnect();
        });
};
