import { IMidiConnectionEvent } from './midi-connection-event';
import { IMidiInput } from './midi-input';
import { IMidiMessageEvent } from './midi-message-event';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiInputEventMap<T extends IMidiInput> {
    midimessage: IMidiMessageEvent;

    statechange: IMidiConnectionEvent<T>;
}
