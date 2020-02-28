import { TSubscribableThing } from './subscribable-thing';

export type TMediaQueryMatchesFunction = (mediaQueryString: string) => TSubscribableThing<boolean>;
