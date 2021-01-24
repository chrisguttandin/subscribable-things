import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { mediaDevices } from '../../src/module';
import xs from 'xstream';

describe('mediaDevices', () => {
    it('should work with RxJS', (done) => {
        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            from(mediaDevices()).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            from(mediaDevices())
                .pipe(first())
                .subscribe((mediaDeviceInfos) => {
                    expect(mediaDeviceInfos.length).to.be.above(0);

                    for (const mediaDeviceInfo of mediaDeviceInfos) {
                        expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                    }

                    done();
                });
        }
    });

    it('should work with XStream', (done) => {
        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            xs.fromObservable(mediaDevices()).subscribe({
                error(err) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');

                    done();
                }
            });
        } else {
            xs.fromObservable(mediaDevices())
                .take(1)
                .subscribe({
                    next(mediaDeviceInfos) {
                        expect(mediaDeviceInfos.length).to.be.above(0);

                        for (const mediaDeviceInfo of mediaDeviceInfos) {
                            expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                        }

                        done();
                    }
                });
        }
    });

    it('should work with callbags', (done) => {
        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            fromObs(mediaDevices())(0, (code, err) => {
                if (code === 2) {
                    expect(err.message).to.equal('The required browser API seems to be not supported.');
                }

                done();
            });
        } else {
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
        }
    });

    it('should work with Bacon.js', (done) => {
        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            fromESObservableBaconJs(mediaDevices()).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableBaconJs(mediaDevices())
                .first()
                .onValue((mediaDeviceInfos) => {
                    expect(mediaDeviceInfos.length).to.be.above(0);

                    for (const mediaDeviceInfo of mediaDeviceInfos) {
                        expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                    }

                    done();
                });
        }
    });

    it('should work with Kefir.js', (done) => {
        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            fromESObservableKefirJs(mediaDevices()).onError((err) => {
                expect(err.message).to.equal('The required browser API seems to be not supported.');

                done();
            });
        } else {
            fromESObservableKefirJs(mediaDevices())
                .take(1)
                .onValue((mediaDeviceInfos) => {
                    expect(mediaDeviceInfos.length).to.be.above(0);

                    for (const mediaDeviceInfo of mediaDeviceInfos) {
                        expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                    }

                    done();
                });
        }
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(mediaDevices());

        // eslint-disable-next-line no-undef
        if (process.env.CI && navigator.userAgent.includes('Firefox')) {
            try {
                eachValueFrom(source$)[Symbol.asyncIterator]();
            } catch (err) {
                expect(err.message).to.equal('The required browser API seems to be not supported.');
            }
        } else {
            // eslint-disable-next-line no-unreachable-loop
            for await (const mediaDeviceInfos of eachValueFrom(source$)) {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                break;
            }
        }
    });
});
