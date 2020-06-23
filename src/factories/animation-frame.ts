import { TAnimationFrameFactory } from '../types';

export const createAnimationFrame: TAnimationFrameFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return () =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.cancelAnimationFrame === undefined || window.requestAnimationFrame === undefined) {
                return emitNotSupportedError(observer);
            }

            let animationFrameHandle = window.requestAnimationFrame(function animationFrameCallback(timestamp): void {
                observer.next(timestamp);

                animationFrameHandle = window.requestAnimationFrame(animationFrameCallback);
            });

            return () => window.cancelAnimationFrame(animationFrameHandle);
        });
};
