import { TMediaDevicesFactory } from '../types';

export const createMediaDevices: TMediaDevicesFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return () =>
        wrapSubscribeFunction((observer) => {
            if (
                window === null ||
                window.navigator === undefined ||
                window.navigator.mediaDevices === undefined ||
                window.navigator.mediaDevices.enumerateDevices === undefined
            ) {
                return emitNotSupportedError(observer);
            }

            let isActive = true;

            const enumerateDevices = () => {
                window.navigator.mediaDevices.enumerateDevices().then(
                    (mediaDevices) => {
                        if (isActive) {
                            observer.next(mediaDevices);
                        }
                    },
                    (err) => {
                        if (isActive) {
                            unsubscribe();

                            observer.error(err);
                        }
                    }
                );
            };
            const unsubscribe = () => {
                isActive = false;
                window.navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
            };

            enumerateDevices();
            window.navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);

            return unsubscribe;
        });
};
