import { IReport, IReportingObserver, IReportingObserverOptions, IResizeObserver, IResizeObserverEntry } from '../interfaces';

// @todo TypeScript does not include type definitions for the Reporting API yet.
export type TWindow = Window & typeof globalThis & {

    ReportingObserver: {

        prototype: IReportingObserver;

        new(callback: (reports: IReport[], observer: IReportingObserver) => void, options?: IReportingObserverOptions): IReportingObserver;

    };

    // @todo TypeScript does not include type definitions for the Resize Observer specification yet.
    ResizeObserver: {

        prototype: IResizeObserver;

        new(callback: (entries: IResizeObserverEntry[], observer: IResizeObserver) => void): IResizeObserver;

    };

};
