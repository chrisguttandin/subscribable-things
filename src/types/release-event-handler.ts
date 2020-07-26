import { TEventHandler } from './event-handler';

// @todo TypeScript does not include type definitions for the Screen Wake Lock API yet.
export type TReleaseEventHandler<T> = TEventHandler<T, Event>;
