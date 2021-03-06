import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { resizes } from '../../src/module';
import xs from 'xstream';

describe('resizes', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', (done) => {
        from(resizes(htmlElement))
            .pipe(first())
            .subscribe((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(resizes(htmlElement))
            .take(1)
            .subscribe({
                next(entries) {
                    expect(entries.length).to.equal(1);
                    expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(resizes(htmlElement)),
            take(1),
            forEach((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(resizes(htmlElement))
            .first()
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(resizes(htmlElement))
            .take(1)
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(resizes(htmlElement));

        // eslint-disable-next-line no-unreachable-loop
        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);
            expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

            break;
        }
    });
});
