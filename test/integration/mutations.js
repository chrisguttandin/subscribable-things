import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
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

});
