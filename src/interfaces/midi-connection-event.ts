import { IMidiPort } from './midi-port';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiConnectionEvent<T extends IMidiPort> extends Event {
    readonly port: T;
}
