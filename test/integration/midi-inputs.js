import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { midiInputs } from '../../src/module';
import xs from 'xstream';

describe('midiInputs()', () => {
    if (navigator.requestMIDIAccess) {
        let midiAccess;

        if (navigator.userAgent.includes('Chrome')) {
            after(() => fetch('/reset-permissions', { body: JSON.stringify({ origin: location.origin }), method: 'POST' }));

            before(() =>
                fetch('/grant-permissions', {
                    body: JSON.stringify({ origin: location.origin, permissions: ['midi', 'midiSysex'] }),
                    headers: { 'content-type': 'application/json' },
                    method: 'POST'
                })
            );
        } else {
            after(() => fetch('/connect-devices', { method: 'POST' }));

            before(() => fetch('/disconnect-devices', { method: 'POST' }));
        }

        beforeEach(async () => (midiAccess = await navigator.requestMIDIAccess({ sysex: true })));

        it('should work with RxJS', (done) => {
            from(midiInputs(midiAccess))
                .pipe(first())
                .subscribe((midiInputsArray) => {
                    expect(midiInputsArray.length).to.be.above(0);

                    const midiInput = midiInputsArray.pop();

                    expect(midiInput).to.be.an.instanceof(MIDIInput);
                    expect(midiInput.name).to.equal('Virtual Input Device');

                    done();
                });
        });

        it('should work with XStream', (done) => {
            xs.fromObservable(midiInputs(midiAccess))
                .take(1)
                .subscribe({
                    next(midiInputsArray) {
                        expect(midiInputsArray.length).to.be.above(0);

                        const midiInput = midiInputsArray.pop();

                        expect(midiInput).to.be.an.instanceof(MIDIInput);
                        expect(midiInput.name).to.equal('Virtual Input Device');

                        done();
                    }
                });
        });

        it('should work with callbags', (done) => {
            pipe(
                fromObs(midiInputs(midiAccess)),
                take(1),
                forEach((midiInputsArray) => {
                    expect(midiInputsArray.length).to.be.above(0);

                    const midiInput = midiInputsArray.pop();

                    expect(midiInput).to.be.an.instanceof(MIDIInput);
                    expect(midiInput.name).to.equal('Virtual Input Device');

                    done();
                })
            );
        });

        it('should work with Bacon.js', (done) => {
            fromESObservableBaconJs(midiInputs(midiAccess))
                .first()
                .onValue((midiInputsArray) => {
                    expect(midiInputsArray.length).to.be.above(0);

                    const midiInput = midiInputsArray.pop();

                    expect(midiInput).to.be.an.instanceof(MIDIInput);
                    expect(midiInput.name).to.equal('Virtual Input Device');

                    done();
                });
        });

        it('should work with Kefir.js', (done) => {
            fromESObservableKefirJs(midiInputs(midiAccess))
                .take(1)
                .onValue((midiInputsArray) => {
                    expect(midiInputsArray.length).to.be.above(0);

                    const midiInput = midiInputsArray.pop();

                    expect(midiInput).to.be.an.instanceof(MIDIInput);
                    expect(midiInput.name).to.equal('Virtual Input Device');

                    done();
                });
        });

        it('should work with rxjs-for-await', async () => {
            const source$ = from(midiInputs(midiAccess));

            // eslint-disable-next-line no-unreachable-loop
            for await (const midiInputsArray of eachValueFrom(source$)) {
                expect(midiInputsArray.length).to.be.above(0);

                const midiInput = midiInputsArray.pop();

                expect(midiInput).to.be.an.instanceof(MIDIInput);
                expect(midiInput.name).to.equal('Virtual Input Device');

                break;
            }
        });

        describe('with a finalization registry', () => {
            let finalizationRegistry;
            let whenCollected;

            afterEach(function (done) {
                this.timeout(0);

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

                whenCollected = () => {
                    clearInterval(interval);
                    done();
                };
            });

            // eslint-disable-next-line no-undef
            beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

            it('should work with hyperf', async () => {
                const test = h`<div id="test">${map(midiInputs(midiAccess), (midiInputsArray) =>
                    midiInputsArray.map(({ name }) => name).join(',')
                )}</div>`;

                document.body.appendChild(test);
                finalizationRegistry.register(test);

                while (true) {
                    try {
                        expect(document.getElementById('test').textContent).to.include('Virtual Input Device');

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
