import { TSubscribableThing } from './subscribable-thing';
import { TWakeLockType } from './wake-lock-type';

export type TWakeLockFunction = (type: TWakeLockType) => TSubscribableThing<boolean>;
