import { IReport, IReportingObserverOptions } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

export type TReportsFunction = (options?: IReportingObserverOptions) => TSubscribableThing<IReport[]>;
