import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { mediaDevices } from '../../src/module';
import xs from 'xstream';

describe('mediaDevices', () => {

    it('should work with RxJS', (done) => {
        from(mediaDevices())
            .pipe(first())
            .subscribe((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(mediaDevices())
            .take(1)
            .subscribe({
                next (mediaDeviceInfos) {
                    expect(mediaDeviceInfos.length).to.be.above(0);

                    for (const mediaDeviceInfo of mediaDeviceInfos) {
                        expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                    }

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(mediaDevices()),
            take(1),
            forEach((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(mediaDevices())
            .first()
            .onValue((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(mediaDevices())
            .take(1)
            .onValue((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                done();
            });
    });

});
