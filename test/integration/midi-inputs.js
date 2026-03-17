import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cdp, commands } from 'vitest/browser';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { midiInputs } from '../../src/module';
import xs from 'xstream';

describe('midiInputs()', { skip: typeof navigator.requestMIDIAccess === 'undefined' }, () => {
    let midiAccess;

    if (navigator.userAgent.includes('Chrome')) {
        afterAll(() => cdp().send('Browser.resetPermissions', { origin: location.origin }));

        afterEach(() => commands.disconnectMidiDevices());

        beforeAll(() => cdp().send('Browser.grantPermissions', { origin: location.origin, permissions: ['midi', 'midiSysex'] }));

        beforeEach(() => commands.connectMidiDevices(), 0);
    }

    beforeEach(async () => {
        midiAccess = await navigator.requestMIDIAccess({ sysex: true });

        if (midiAccess.inputs.size === 0) {
            return new Promise((resolve) => {
                midiAccess.onstatechange = () => {
                    if (midiAccess.inputs.size > 0) {
                        midiAccess.onstatechange = null;

                        resolve();
                    }
                };
            });
        }
    });

    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(midiInputs(midiAccess))
            .pipe(first())
            .subscribe((midiInputsArray) => {
                expect(midiInputsArray.length).to.be.above(0);

                const midiInput = midiInputsArray.pop();

                expect(midiInput).to.be.an.instanceof(MIDIInput);
                expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(midiInputs(midiAccess))
            .take(1)
            .subscribe({
                next(midiInputsArray) {
                    expect(midiInputsArray.length).to.be.above(0);

                    const midiInput = midiInputsArray.pop();

                    expect(midiInput).to.be.an.instanceof(MIDIInput);
                    expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(midiInputs(midiAccess)),
            take(1),
            forEach((midiInputsArray) => {
                expect(midiInputsArray.length).to.be.above(0);

                const midiInput = midiInputsArray.pop();

                expect(midiInput).to.be.an.instanceof(MIDIInput);
                expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(midiInputs(midiAccess))
            .first()
            .onValue((midiInputsArray) => {
                expect(midiInputsArray.length).to.be.above(0);

                const midiInput = midiInputsArray.pop();

                expect(midiInput).to.be.an.instanceof(MIDIInput);
                expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(midiInputs(midiAccess))
            .take(1)
            .onValue((midiInputsArray) => {
                expect(midiInputsArray.length).to.be.above(0);

                const midiInput = midiInputsArray.pop();

                expect(midiInput).to.be.an.instanceof(MIDIInput);
                expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(midiInputs(midiAccess));

        // eslint-disable-next-line no-unreachable-loop
        for await (const midiInputsArray of eachValueFrom(source$)) {
            expect(midiInputsArray.length).to.be.above(0);

            const midiInput = midiInputsArray.pop();

            expect(midiInput).to.be.an.instanceof(MIDIInput);
            expect(midiInput.name).to.equal('Test Control MIDI Device Input Port');

            break;
        }
    });

    describe('with a finalization registry', () => {
        let finalizationRegistry;
        let whenCollected;

        afterEach(() => {
            const arrayBuffers = [];

            let byteLength = 100;

            const interval = setInterval(() => {
                try {
                    arrayBuffers.push(new ArrayBuffer(byteLength));

                    byteLength *= 10;
                } catch {
                    if (byteLength > 1) {
                        byteLength /= 10;
                    }
                }
            });
            const { promise, resolve } = Promise.withResolvers();

            whenCollected = () => {
                clearInterval(interval);
                resolve();
            };

            return promise;
        }, 0);

        // eslint-disable-next-line no-undef
        beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

        it('should work with hyperf', async () => {
            const test = h`<div id="test">${map(midiInputs(midiAccess), (midiInputsArray) =>
                midiInputsArray.map(({ name }) => name).join(',')
            )}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.include('Test Control MIDI Device Input Port');

                    break;
                } catch {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 100);
                    });
                }
            }

            document.body.removeChild(test);
        });
    });
});
