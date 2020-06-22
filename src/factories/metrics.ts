import { TMetricsFactory } from '../types';

export const createMetrics: TMetricsFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (options) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.PerformanceObserver === undefined) {
                return emitNotSupportedError(observer);
            }

            const performanceObserver = new window.PerformanceObserver((entryList) => observer.next(entryList.getEntries()));

            try {
                performanceObserver.observe(options);
            } catch (err) {
                observer.error(err);
            }

            return () => performanceObserver.disconnect();
        });
};
