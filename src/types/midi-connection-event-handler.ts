import { IMidiConnectionEvent, IMidiPort } from '../interfaces';
import { TEventHandler } from './event-handler';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export type TMidiConnectionEventHandler<T extends IMidiPort> = TEventHandler<T, IMidiConnectionEvent<T>>;
