import { TSubscribableThing } from './subscribable-thing';

export type TUnhandledRejectionFunction = (coolingOffPeriod: number) => TSubscribableThing<any>;
