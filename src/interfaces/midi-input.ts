import { TMidiConnectionEventHandler, TMidiMessageEventHandler } from '../types';
import { IMidiInputEventMap } from './midi-input-event-map';
import { IMidiPort } from './midi-port';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiInput extends IMidiPort {
    onmidimessage: null | TMidiMessageEventHandler<this>;

    onstatechange: null | TMidiConnectionEventHandler<this>;

    readonly type: 'input';

    addEventListener<K extends keyof IMidiInputEventMap<this>>(
        type: K,
        listener: (this: this, event: IMidiInputEventMap<this>[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof IMidiInputEventMap<this>>(
        type: K,
        listener: (this: this, event: IMidiInputEventMap<this>[K]) => void,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
