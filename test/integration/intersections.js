import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { intersections } from '../../src/module';
import xs from 'xstream';

describe('intersections', () => {

    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', (done) => {
        from(intersections(document.body))
            .pipe(first())
            .subscribe((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(intersections(document.body))
            .take(1)
            .subscribe({
                next (entries) {
                    expect(entries.length).to.equal(1);
                    expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(intersections(document.body)),
            take(1),
            forEach((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(intersections(document.body))
            .first()
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(intersections(document.body))
            .take(1)
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(intersections(document.body));

        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);
            expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

            break;
        }
    });

});
