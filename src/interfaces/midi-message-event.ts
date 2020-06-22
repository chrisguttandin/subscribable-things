// @todo TypeScript does not include type definitions for the Web MIDI API yet.
export interface IMidiMessageEvent extends Event {
    readonly data: Uint8Array;
}
