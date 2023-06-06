import { IReportBody } from './report-body';

// @todo TypeScript does not include type definitions for the Reporting API yet.
export interface IReport {
    readonly body: null | IReportBody;

    readonly type: string;

    readonly url: string;
}
