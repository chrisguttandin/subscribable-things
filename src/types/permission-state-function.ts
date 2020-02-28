import { TSubscribableThing } from './subscribable-thing';

export type TPermissionStateFunction = (...args: Parameters<Permissions['query']>) => TSubscribableThing<PermissionState>;
