import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { permissionState } from '../../src/module';
import xs from 'xstream';

describe('permissionState', () => {
    it('should work with RxJS', (done) => {
        if (navigator.permissions === undefined) {
            from(permissionState({ name: 'notifications' })).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            from(permissionState({ name: 'notifications' }))
                .pipe(first())
                .subscribe((state) => {
                    expect(state).to.equal('prompt');

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        if (navigator.permissions === undefined) {
            xs.fromObservable(permissionState({ name: 'notifications' })).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            xs.fromObservable(permissionState({ name: 'notifications' }))
                .take(1)
                .subscribe({
                    next(state) {
                        expect(state).to.equal('prompt');

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        if (navigator.permissions === undefined) {
            fromObs(permissionState({ name: 'notifications' }))(0, (code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            });
        } else {
            pipe(
                fromObs(permissionState({ name: 'notifications' })),
                take(1),
                forEach((state) => {
                    expect(state).to.equal('prompt');

                    done();
                })
            );
        }
    });

    it('should work with Bacon.js', (done) => {
        if (navigator.permissions === undefined) {
            fromESObservableBaconJs(permissionState({ name: 'notifications' })).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableBaconJs(permissionState({ name: 'notifications' }))
                .first()
                .onValue((state) => {
                    expect(state).to.equal('prompt');

                    done();
                });
        }
    });

    it('should work with Kefir.js', (done) => {
        if (navigator.permissions === undefined) {
            fromESObservableKefirJs(permissionState({ name: 'notifications' })).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableKefirJs(permissionState({ name: 'notifications' }))
                .take(1)
                .onValue((state) => {
                    expect(state).to.equal('prompt');

                    done();
                });
        }
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(permissionState({ name: 'notifications' }));

        if (navigator.permissions === undefined) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.message).to.equal('The required browser API seems to be not supported.');
            }
        } else {
            // eslint-disable-next-line no-unreachable-loop
            for await (const state of eachValueFrom(source$)) {
                expect(state).to.equal('prompt');

                break;
            }
        }
    });

    if (navigator.permissions !== undefined) {
        it('should work with hyperf', async () => {
            const test = h`<div id="test">${permissionState({ name: 'notifications' })}</div>`;

            document.body.appendChild(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('prompt');

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
