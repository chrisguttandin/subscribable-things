import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { midiInputs } from '../../src/module';
import xs from 'xstream';

describe('midiInputs()', () => {
    if (navigator.requestMIDIAccess) {
        let midiAccess;

        after(() => fetch('/reset-permissions'));

        before(async () => {
            await fetch('/grant-permissions', {
                body: JSON.stringify(['midi', 'midiSysex']),
                headers: { 'content-type': 'application/json' },
                method: 'POST'
            });

            midiAccess = await navigator.requestMIDIAccess({ sysex: true });
        });

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

        it('should work with hyperf', async () => {
            const test = h`<div id="test">${map(midiInputs(midiAccess), (midiInputsArray) =>
                midiInputsArray.map(({ name }) => name).join(',')
            )}</div>`;

            document.body.appendChild(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('Virtual Input Device');

                    break;
                } catch {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 100);
                    });
                }
            }

            document.body.removeChild(test);
        });
    }
});
