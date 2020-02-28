import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
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
                next (isMatching) {
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

});
