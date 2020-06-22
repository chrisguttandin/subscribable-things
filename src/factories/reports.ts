import { TReportsFactory } from '../types';

export const createReports: TReportsFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (options) =>
        wrapSubscribeFunction((observer) => {
            if (window === null || window.ReportingObserver === undefined) {
                return emitNotSupportedError(observer);
            }

            const reportingObserver = new window.ReportingObserver((reportList) => observer.next(reportList), options);

            reportingObserver.observe();

            return () => reportingObserver.disconnect();
        });
};
