import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { mutations } from '../../src/module';
import xs from 'xstream';

describe('mutations', () => {

    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', (done) => {
        from(mutations(document.body, { childList: true }))
            .pipe(first())
            .subscribe((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(mutations(document.body, { childList: true }))
            .take(1)
            .subscribe({
                next (records) {
                    expect(records.length).to.equal(1);
                    expect(records[0]).to.be.an.instanceof(MutationRecord);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(mutations(document.body, { childList: true })),
            take(1),
            forEach((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(mutations(document.body, { childList: true }))
            .first()
            .onValue((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(mutations(document.body, { childList: true }))
            .take(1)
            .onValue((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                done();
            });
    });

});
