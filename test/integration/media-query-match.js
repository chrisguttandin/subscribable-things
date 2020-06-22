import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { mediaQueryMatch } from '../../src/module';
import xs from 'xstream';

describe('mediaQueryMatch', () => {
    it('should work with RxJS', (done) => {
        from(mediaQueryMatch('(max-width:600px)'))
            .pipe(first())
            .subscribe((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(mediaQueryMatch('(max-width:600px)'))
            .take(1)
            .subscribe({
                next(isMatching) {
                    expect(isMatching).to.be.a('boolean');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(mediaQueryMatch('(max-width:600px)')),
            take(1),
            forEach((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(mediaQueryMatch('(max-width:600px)'))
            .first()
            .onValue((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(mediaQueryMatch('(max-width:600px)'))
            .take(1)
            .onValue((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(mediaQueryMatch('(max-width:600px)'));

        for await (const isMatching of eachValueFrom(source$)) {
            expect(isMatching).to.be.a('boolean');

            break;
        }
    });
});
