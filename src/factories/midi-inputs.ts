import { TMidiInputsFactory } from '../types';

export const createMidiInputs: TMidiInputsFactory = (wrapSubscribeFunction) => {
    return (midiAccess) =>
        wrapSubscribeFunction((observer) => {
            let midiInputs = Array.from(midiAccess.inputs.values());

            const emitMidiInputs = () => {
                const midiAccessInputs = midiAccess.inputs;

                if (midiInputs.length !== midiAccessInputs.size || midiInputs.some(({ id }) => !midiAccessInputs.has(id))) {
                    midiInputs = Array.from(midiAccessInputs.values());

                    observer.next(midiInputs);
                }
            };

            observer.next(midiInputs);
            midiAccess.addEventListener('statechange', emitMidiInputs);

            return () => midiAccess.removeEventListener('statechange', emitMidiInputs);
        });
};
