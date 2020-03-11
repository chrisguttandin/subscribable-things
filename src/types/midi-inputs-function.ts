import { IMidiAccess, IMidiInput } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export type TMidiInputsFunction = (midiAccess: IMidiAccess) => TSubscribableThing<IMidiInput[]>;
