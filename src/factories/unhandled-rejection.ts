import { TUnhandledRejectionFactory } from '../types';

export const createUnhandledRejection: TUnhandledRejectionFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (coolingOffPeriod) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.clearInterval === undefined || window.setInterval === undefined) {
                return emitNotSupportedError(observer);
            }

            const possiblyUnhandledRejections = new Map<Promise<any>, { reason: any; timestamp: number }>();

            let intervalId: null | number = null;

            const deletePossiblyUnhandledRejection = ({ promise }: PromiseRejectionEvent) => possiblyUnhandledRejections.delete(promise);
            const emitUnhandledRejection = () => {
                const latestTimestampToEmit = Date.now() - coolingOffPeriod;

                possiblyUnhandledRejections.forEach(({ reason, timestamp }, promise) => {
                    if (timestamp > latestTimestampToEmit) {
                        return;
                    }

                    possiblyUnhandledRejections.delete(promise);
                    observer.next(reason);
                });

                if (intervalId !== null && possiblyUnhandledRejections.size === 0) {
                    window.clearInterval(intervalId);
                    intervalId = null;
                }
            };
            const registerPossiblyUnhandledRejection = (event: PromiseRejectionEvent) => {
                event.preventDefault();

                possiblyUnhandledRejections.set(event.promise, {
                    reason: event.reason,
                    timestamp: Date.now()
                });

                if (intervalId === null) {
                    intervalId = window.setInterval(emitUnhandledRejection, coolingOffPeriod / 2);
                }
            };

            window.addEventListener('rejectionhandled', deletePossiblyUnhandledRejection);
            window.addEventListener('unhandledrejection', registerPossiblyUnhandledRejection);

            return () => {
                if (intervalId !== null) {
                    window.clearInterval(intervalId);
                }

                window.removeEventListener('rejectionhandled', deletePossiblyUnhandledRejection);
                window.removeEventListener('unhandledrejection', registerPossiblyUnhandledRejection);
            };
        });
};
