import { IMidiAccess, IMidiInput } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

export type TMidiInputsFunction = (midiAccess: IMidiAccess) => TSubscribableThing<IMidiInput[]>;
