import { TMidiConnectionEventHandler } from '../types';
import { IMidiOutputEventMap } from './midi-output-event-map';
import { IMidiPort } from './midi-port';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiOutput extends IMidiPort {
    onstatechange: null | TMidiConnectionEventHandler<this>;

    readonly type: 'output';

    addEventListener<K extends keyof IMidiOutputEventMap<this>>(
        type: K,
        listener: (this: this, event: IMidiOutputEventMap<this>[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    clear(): void;

    removeEventListener<K extends keyof IMidiOutputEventMap<this>>(
        type: K,
        listener: (this: this, event: IMidiOutputEventMap<this>[K]) => void,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    send(data: number[] | Uint8Array, timestamp?: number): void;
}
