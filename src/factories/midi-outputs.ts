import { TMidiOutputsFactory } from '../types';

export const createMidiOutputs: TMidiOutputsFactory = (wrapSubscribeFunction) => {
    return (midiAccess) =>
        wrapSubscribeFunction((observer) => {
            let midiOutputs = Array.from(midiAccess.outputs.values());

            const emitMidiOutputs = () => {
                const midiAccessOutputs = midiAccess.outputs;

                if (midiOutputs.length !== midiAccessOutputs.size || midiOutputs.some(({ id }) => !midiAccessOutputs.has(id))) {
                    midiOutputs = Array.from(midiAccessOutputs.values());

                    observer.next(midiOutputs);
                }
            };

            observer.next(midiOutputs);
            midiAccess.addEventListener('statechange', emitMidiOutputs);

            return () => midiAccess.removeEventListener('statechange', emitMidiOutputs);
        });
};
