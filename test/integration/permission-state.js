import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { permissionState } from '../../src/module';
import xs from 'xstream';

describe('permissionState', () => {

    it('should work with RxJS', (done) => {
        from(permissionState({ name: 'geolocation' }))
            .pipe(first())
            .subscribe((state) => {
                expect(state).to.equal('prompt');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(permissionState({ name: 'geolocation' }))
            .take(1)
            .subscribe({
                next (state) {
                    expect(state).to.equal('prompt');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(permissionState({ name: 'geolocation' })),
            take(1),
            forEach((state) => {
                expect(state).to.equal('prompt');

                done();
            })
        );
    });

});
