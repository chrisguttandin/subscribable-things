import { IReport } from './report';

// @todo TypeScript does not include type definitions for the Reporting API yet.
export interface IReportingObserver {
    disconnect(): void;

    observe(): void;

    takeRecords(): IReport[];
}
