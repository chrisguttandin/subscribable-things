import { IWakeLockSentinel } from '../interfaces';
import { TWakeLockFactory } from '../types';

export const createWakeLock: TWakeLockFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (type) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.navigator === undefined || window.navigator.wakeLock === undefined) {
                return emitNotSupportedError(observer);
            }

            const releaseWakeLock = (wakeLockSentinel: IWakeLockSentinel) =>
                wakeLockSentinel.release().catch(() => {
                    // Ignore errors.
                });
            const removeReleaseEventListener = (wakeLockSentinel: IWakeLockSentinel) => {
                wakeLockSentinel.onrelease = null;
            };

            let isActive = true;

            const unsubscribeWhileRequesting = () => {
                isActive = false;
            };

            let unsubscribe = unsubscribeWhileRequesting;

            const requestWakeLock = () =>
                window.navigator.wakeLock.request(type).then(
                    (wakeLockSentinel) => {
                        if (isActive) {
                            observer.next(true);
                        }

                        if (isActive) {
                            wakeLockSentinel.onrelease = () => {
                                observer.next(false);

                                unsubscribe = unsubscribeWhileRequesting;

                                removeReleaseEventListener(wakeLockSentinel);
                                requestWakeLock();
                            };

                            unsubscribe = () => {
                                removeReleaseEventListener(wakeLockSentinel);
                                releaseWakeLock(wakeLockSentinel);
                            };
                        } else {
                            releaseWakeLock(wakeLockSentinel);
                        }
                    },
                    (err) => {
                        if (isActive) {
                            observer.error(err);
                        }
                    }
                );

            requestWakeLock();

            return () => unsubscribe();
        });
};
