import { TMidiPortConnectionState, TMidiPortDeviceState, TMidiPortType } from '../types';

// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiPort extends EventTarget {
    readonly connection: TMidiPortConnectionState;

    readonly id: string;

    readonly manufacturer?: string;

    readonly name?: string;

    readonly state: TMidiPortDeviceState;

    readonly type: TMidiPortType;

    readonly version?: string;

    close(): Promise<this>;

    open(): Promise<this>;
}
