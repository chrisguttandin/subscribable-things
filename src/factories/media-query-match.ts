import { TMediaQueryMatchFactory } from '../types';

export const createMediaQueryMatch: TMediaQueryMatchFactory = (window, wrapSubscribeFunction) => {
    return (mediaQueryString) => wrapSubscribeFunction((observer) => {
        const mediaQueryList = window.matchMedia(mediaQueryString);

        observer.next(mediaQueryList.matches);

        mediaQueryList.onchange = () => observer.next(mediaQueryList.matches);

        return () => { mediaQueryList.onchange = null; };
    });
};
