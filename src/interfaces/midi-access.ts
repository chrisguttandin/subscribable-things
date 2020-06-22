import { IMidiInput } from './midi-input';
import { IMidiOutput } from './midi-output';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiAccess extends EventTarget {
    // @todo This should be a ReadonlyMap.
    readonly inputs: Map<string, IMidiInput>;

    // The onstatechange property is not needed for the purpose of this package.

    // @todo This should be a ReadonlyMap.
    readonly outputs: Map<string, IMidiOutput>;

    // The sysexEnabled property is not needed for the purpose of this package.
}
