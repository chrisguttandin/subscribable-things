import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { midiOutputs } from '../../src/module';
import xs from 'xstream';

describe('midiOutputs()', () => {
    if (navigator.requestMIDIAccess) {
        let midiAccess;

        after(() => fetch('/reset-permissions'));

        before(async () => {
            await fetch('/grant-permissions');

            midiAccess = await navigator.requestMIDIAccess({ sysex: true });
        });

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

            for await (const midiOutputsArray of eachValueFrom(source$)) {
                expect(midiOutputsArray.length).to.be.above(0);

                const midiOutput = midiOutputsArray.pop();

                expect(midiOutput).to.be.an.instanceof(MIDIOutput);
                expect(midiOutput.name).to.equal('Virtual Output Device');

                break;
            }
        });
    }
});
