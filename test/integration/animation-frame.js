import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { animationFrame } from '../../src/module';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import xs from 'xstream';

describe('animationFrame', () => {
    it('should work with RxJS', (done) => {
        from(animationFrame())
            .pipe(first())
            .subscribe((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(animationFrame())
            .take(1)
            .subscribe({
                next(timestamp) {
                    expect(timestamp).to.be.a('number');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(animationFrame()),
            take(1),
            forEach((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(animationFrame())
            .first()
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(animationFrame())
            .take(1)
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(animationFrame());

        for await (const timestamp of eachValueFrom(source$)) {
            expect(timestamp).to.be.a('number');

            break;
        }
    });
});
