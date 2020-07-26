import { TWakeLockType } from '../types';
import { IWakeLockSentinel } from './wake-lock-sentinel';

// @todo TypeScript does not include type definitions for the Screen Wake Lock API yet.
export interface IWakeLock {
    request(type: TWakeLockType): Promise<IWakeLockSentinel>;
}
