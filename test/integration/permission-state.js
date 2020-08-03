import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
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
                next(state) {
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

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(permissionState({ name: 'geolocation' }))
            .first()
            .onValue((state) => {
                expect(state).to.equal('prompt');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(permissionState({ name: 'geolocation' }))
            .take(1)
            .onValue((state) => {
                expect(state).to.equal('prompt');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(permissionState({ name: 'geolocation' }));

        // eslint-disable-next-line no-unreachable-loop
        for await (const state of eachValueFrom(source$)) {
            expect(state).to.equal('prompt');

            break;
        }
    });
});
