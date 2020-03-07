import { TSubscribableThing } from './subscribable-thing';

export type TMediaDevicesFunction = () => TSubscribableThing<MediaDeviceInfo[]>;
