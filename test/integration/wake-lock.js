import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { wakeLock } from '../../src/module';
import xs from 'xstream';

describe('wakeLock', () => {
    if (navigator.wakeLock) {
        after(() => fetch('/reset-permissions'));

        before(() =>
            fetch('/grant-permissions', {
                body: JSON.stringify(['wakeLockScreen']),
                headers: { 'content-type': 'application/json' },
                method: 'POST'
            })
        );

        it('should work with RxJS', (done) => {
            from(wakeLock('screen'))
                .pipe(first())
                .subscribe((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        });

        it('should work with XStream', (done) => {
            xs.fromObservable(wakeLock('screen'))
                .take(1)
                .subscribe({
                    next(isLocked) {
                        expect(isLocked).to.be.true;

                        done();
                    }
                });
        });

        it('should work with callbags', (done) => {
            pipe(
                fromObs(wakeLock('screen')),
                take(1),
                forEach((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                })
            );
        });

        it('should work with Bacon.js', (done) => {
            fromESObservableBaconJs(wakeLock('screen'))
                .first()
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        });

        it('should work with Kefir.js', (done) => {
            fromESObservableKefirJs(wakeLock('screen'))
                .take(1)
                .onValue((isLocked) => {
                    expect(isLocked).to.be.true;

                    done();
                });
        });

        it('should work with rxjs-for-await', async () => {
            const source$ = from(wakeLock('screen'));

            // eslint-disable-next-line no-unreachable-loop
            for await (const isLocked of eachValueFrom(source$)) {
                expect(isLocked).to.be.true;

                break;
            }
        });
    }
});
