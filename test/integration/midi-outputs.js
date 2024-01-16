import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { midiOutputs } from '../../src/module';
import xs from 'xstream';

describe('midiOutputs()', () => {
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
            from(midiOutputs(midiAccess))
                .pipe(first())
                .subscribe((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    done();
                });
        });

        it('should work with XStream', (done) => {
            xs.fromObservable(midiOutputs(midiAccess))
                .take(1)
                .subscribe({
                    next(midiOutputsArray) {
                        expect(midiOutputsArray.length).to.be.above(0);

                        const midiOutput = midiOutputsArray.pop();

                        expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                        expect(midiOutput.name).to.equal('Virtual Output Device');

                        done();
                    }
                });
        });

        it('should work with callbags', (done) => {
            pipe(
                fromObs(midiOutputs(midiAccess)),
                take(1),
                forEach((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    done();
                })
            );
        });

        it('should work with Bacon.js', (done) => {
            fromESObservableBaconJs(midiOutputs(midiAccess))
                .first()
                .onValue((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    done();
                });
        });

        it('should work with Kefir.js', (done) => {
            fromESObservableKefirJs(midiOutputs(midiAccess))
                .take(1)
                .onValue((midiOutputsArray) => {
                    expect(midiOutputsArray.length).to.be.above(0);

                    const midiOutput = midiOutputsArray.pop();

                    expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                    expect(midiOutput.name).to.equal('Virtual Output Device');

                    done();
                });
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

            afterEach(function (done) {
                this.timeout(0);

                const arrayBuffers = [];
                const interval = setInterval(() => {
                    try {
                        arrayBuffers.push(
                            new ArrayBuffer(arrayBuffers.length === 0 ? 100 : arrayBuffers[arrayBuffers.length - 1].byteLength * 10)
                        );
                    } catch {
                        arrayBuffers.pop();
                    }
                }, 100);

                whenCollected = () => {
                    clearInterval(interval);
                    done();
                };
            });

            // eslint-disable-next-line no-undef
            beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

            it('should work with hyperf', async () => {
                const test = h`<div id="test">${map(midiOutputs(midiAccess), (midiInputsArray) =>
                    midiInputsArray.map(({ name }) => name).join(',')
                )}</div>`;

                document.body.appendChild(test);
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
