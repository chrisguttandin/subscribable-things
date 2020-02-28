import { TSubscribableThing } from './subscribable-thing';

export type TMediaQueryMatchFunction = (mediaQueryString: string) => TSubscribableThing<boolean>;
