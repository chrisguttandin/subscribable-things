import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { online } from '../../src/module';
import xs from 'xstream';

describe('online', () => {
    it('should work with RxJS', (done) => {
        from(online())
            .pipe(first())
            .subscribe((isOnline) => {
                expect(isOnline).to.be.true;

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(online())
            .take(1)
            .subscribe({
                next(isOnline) {
                    expect(isOnline).to.be.true;

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(online()),
            take(1),
            forEach((isOnline) => {
                expect(isOnline).to.be.true;

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(online())
            .first()
            .onValue((isOnline) => {
                expect(isOnline).to.be.true;

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(online())
            .take(1)
            .onValue((isOnline) => {
                expect(isOnline).to.be.true;

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(online());

        for await (const isOnline of eachValueFrom(source$)) {
            expect(isOnline).to.be.true;

            break;
        }
    });
});
