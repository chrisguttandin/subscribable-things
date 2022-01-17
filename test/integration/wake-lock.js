import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { wakeLock } from '../../src/module';
import xs from 'xstream';

describe('wakeLock', () => {
    if (navigator.wakeLock !== undefined) {
        after(() => fetch('/reset-permissions'));

        before(() =>
            fetch('/grant-permissions', {
                body: JSON.stringify(['wakeLockScreen']),
                headers: { 'content-type': 'application/json' },
                method: 'POST'
            })
        );
    }

    it('should work with RxJS', (done) => {
        if (navigator.wakeLock === undefined) {
            from(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            from(wakeLock('screen'))
                .pipe(first())
                .subscribe((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        if (navigator.wakeLock === undefined) {
            xs.fromObservable(wakeLock('screen')).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            xs.fromObservable(wakeLock('screen'))
                .take(1)
                .subscribe({
                    next(isLocked) {
                        expect(isLocked).to.be.true;

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        if (navigator.wakeLock === undefined) {
            fromObs(wakeLock('screen'))(0, (code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            });
        } else {
            pipe(
                fromObs(wakeLock('screen')),
                take(1),
                forEach((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                })
            );
        }
    });

    it('should work with Bacon.js', (done) => {
        if (navigator.wakeLock === undefined) {
            fromESObservableBaconJs(wakeLock('screen')).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableBaconJs(wakeLock('screen'))
                .first()
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with Kefir.js', (done) => {
        if (navigator.wakeLock === undefined) {
            fromESObservableKefirJs(wakeLock('screen')).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableKefirJs(wakeLock('screen'))
                .take(1)
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        }
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(wakeLock('screen'));

        if (navigator.wakeLock === undefined) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.message).to.equal('The required browser API seems to be not supported.');
            }
        } else {
            // eslint-disable-next-line no-unreachable-loop
            for await (const isLocked of eachValueFrom(source$)) {
                expect(isLocked).to.be.true;

                break;
            }
        }
    });

    if (navigator.wakeLock !== undefined) {
        it('should work with hyperf', async () => {
            const test = h`<div id="test">${wakeLock('screen')}</div>`;

            document.body.appendChild(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('true');

                    break;
                } catch {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 100);
                    });
                }
            }

            document.body.removeChild(test);
            test[Symbol.dispose]();
        });
    }
});
