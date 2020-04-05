import { TSubscribableThing } from './subscribable-thing';

export type TMetricsFunction = (options: PerformanceObserverInit) => TSubscribableThing<PerformanceEntry[]>;
