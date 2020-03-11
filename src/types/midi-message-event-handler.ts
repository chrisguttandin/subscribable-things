import { IMidiMessageEvent } from '../interfaces';
import { TEventHandler } from './event-handler';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export type TMidiMessageEventHandler<T> = TEventHandler<T, IMidiMessageEvent>;
