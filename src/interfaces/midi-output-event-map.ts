import { IMidiConnectionEvent } from './midi-connection-event';
import { IMidiOutput } from './midi-output';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiOutputEventMap<T extends IMidiOutput> {
    statechange: IMidiConnectionEvent<T>;
}
