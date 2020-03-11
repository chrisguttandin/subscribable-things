import { TMidiInputsFunction } from './midi-inputs-function';
import { TWrapSubscribeFunctionFunction } from './wrap-subscribe-function-function';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export type TMidiInputsFactory = (wrapSubscribeFunction: TWrapSubscribeFunctionFunction) => TMidiInputsFunction;
