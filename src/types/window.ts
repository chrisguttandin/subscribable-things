import { IReport, IReportingObserver, IReportingObserverOptions } from '../interfaces';

// @todo TypeScript does not include type definitions for the Reporting API yet.
export type TWindow = Window & typeof globalThis & {

    ReportingObserver: {

        prototype: IReportingObserver;

        new(callback: (reports: IReport[], observer: IReportingObserver) => void, options?: IReportingObserverOptions): IReportingObserver;

    };

};
