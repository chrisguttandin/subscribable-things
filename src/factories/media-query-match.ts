import { TMediaQueryMatchFactory } from '../types';

export const createMediaQueryMatch: TMediaQueryMatchFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (mediaQueryString) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.matchMedia === undefined) {
                return emitNotSupportedError(observer);
            }

            const mediaQueryList = window.matchMedia(mediaQueryString);

            observer.next(mediaQueryList.matches);

            mediaQueryList.onchange = () => observer.next(mediaQueryList.matches);

            return () => {
                mediaQueryList.onchange = null;
            };
        });
};
