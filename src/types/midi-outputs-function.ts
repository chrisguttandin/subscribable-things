import { IMidiAccess, IMidiOutput } from '../interfaces';
import { TSubscribableThing } from './subscribable-thing';

export type TMidiOutputsFunction = (midiAccess: IMidiAccess) => TSubscribableThing<IMidiOutput[]>;
