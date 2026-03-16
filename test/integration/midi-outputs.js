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
import { midiOutputs } from '../../src/module';
import xs from 'xstream';

describe('midiOutputs()', { skip: typeof navigator.requestMIDIAccess === 'undefined' }, () => {
    if (navigator.requestMIDIAccess) {
        let midiAccess;

        if (navigator.userAgent.includes('Chrome')) {
            afterAll(() => cdp().send('Browser.resetPermissions', { origin: location.origin }));

            beforeAll(() => cdp().send('Browser.grantPermissions', { origin: location.origin, permissions: ['midi', 'midiSysex'] }));
        }

        afterAll(() => commands.disconnectMidiDevices());

        beforeAll(() => commands.connectMidiDevices(), 0);

        beforeEach(async () => {
            midiAccess = await navigator.requestMIDIAccess({ sysex: true });

            if (midiAccess.outputs.size === 0) {
                return new Promise((resolve) => {
                    midiAccess.onstatechange = () => {
                        if (midiAccess.outputs.size > 0) {
                            midiAccess.onstatechange = null;

                            resolve();
                        }
                    };
                });
            }
        });

        it('should work with RxJS', () => {
            const { promise, resolve } = Promise.withResolvers();

            from(midiOutputs(midiAccess))
                .pipe(first())
                .subscribe((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    resolve();
                });

            return promise;
        });

        it('should work with XStream', () => {
            const { promise, resolve } = Promise.withResolvers();

            xs.fromObservable(midiOutputs(midiAccess))
                .take(1)
                .subscribe({
                    next(midiOutputsArray) {
                        expect(midiOutputsArray.length).to.be.above(0);

                        const midiOutput = midiOutputsArray.pop();

                        expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                        expect(midiOutput.name).to.equal('Virtual Output Device');

                        resolve();
                    }
                });

            return promise;
        });

        it('should work with callbags', () => {
            const { promise, resolve } = Promise.withResolvers();

            pipe(
                fromObs(midiOutputs(midiAccess)),
                take(1),
                forEach((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    resolve();
                })
            );

            return promise;
        });

        it('should work with Bacon.js', () => {
            const { promise, resolve } = Promise.withResolvers();

            fromESObservableBaconJs(midiOutputs(midiAccess))
                .first()
                .onValue((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    resolve();
                });

            return promise;
        });

        it('should work with Kefir.js', () => {
            const { promise, resolve } = Promise.withResolvers();

            fromESObservableKefirJs(midiOutputs(midiAccess))
                .take(1)
                .onValue((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    resolve();
                });

            return promise;
        });

        it('should work with rxjs-for-await', async () => {
            const source$ = from(midiOutputs(midiAccess));

            // eslint-disable-next-line no-unreachable-loop
            for await (const midiOutputsArray of eachValueFrom(source$)) {
                expect(midiOutputsArray.length).to.be.above(0);

                const midiOutput = midiOutputsArray.pop();

                expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                expect(midiOutput.name).to.equal('Virtual Output Device');

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
                        byteLength /= 10;
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
                const test = h`<div id="test">${map(midiOutputs(midiAccess), (midiInputsArray) =>
                    midiInputsArray.map(({ name }) => name).join(',')
                )}</div>`;

                setTimeout(() => document.body.appendChild(test));
                finalizationRegistry.register(test);

                while (true) {
                    try {
                        expect(document.getElementById('test').textContent).to.include('Virtual Output Device');

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
    }
});
