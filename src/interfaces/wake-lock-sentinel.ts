import { TReleaseEventHandler, TWakeLockType } from '../types';
import { IWakeLockSentinelEventMap } from './wake-lock-sentinel-event-map';

// @todo TypeScript does not include type definitions for the Screen Wake Lock API yet.
export interface IWakeLockSentinel extends EventTarget {
    onrelease: null | TReleaseEventHandler<this>;

    readonly type: TWakeLockType;

    addEventListener<K extends keyof IWakeLockSentinelEventMap>(
        type: K,
        listener: (this: this, event: IWakeLockSentinelEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    release(): Promise<void>;

    removeEventListener<K extends keyof IWakeLockSentinelEventMap>(
        type: K,
        listener: (this: this, event: IWakeLockSentinelEventMap[K]) => void,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
