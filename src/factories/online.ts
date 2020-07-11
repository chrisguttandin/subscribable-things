import { TOnlineFactory } from '../types';

export const createOnline: TOnlineFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return () =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.navigator === undefined || window.navigator.onLine === undefined) {
                return emitNotSupportedError(observer);
            }

            const emitFalse = () => observer.next(false);
            const emitTrue = () => observer.next(true);

            window.addEventListener('offline', emitFalse);
            window.addEventListener('online', emitTrue);

            observer.next(window.navigator.onLine);

            return () => {
                window.removeEventListener('offline', emitFalse);
                window.removeEventListener('online', emitTrue);
            };
        });
};
