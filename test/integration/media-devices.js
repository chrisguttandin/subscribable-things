import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
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

    // eslint-disable-next-line no-undef
    if (!process.env.CI || !navigator.userAgent.includes('Firefox')) {
        describe('with a finalization registry', () => {
            let finalizationRegistry;
            let whenCollected;

            afterEach(function (done) {
                this.timeout(0);

                const arrayBuffers = [];

                let byteLength = 100;

                const interval = setInterval(() => {
                    try {
                        arrayBuffers.push(new ArrayBuffer(byteLength));

                        byteLength *= 10;
                    } catch {
                        byteLength /= 10;
                    }
                });

                whenCollected = () => {
                    clearInterval(interval);
                    done();
                };
            });

            // eslint-disable-next-line no-undef
            beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

            it('should work with hyperf', async () => {
                const test = h`<div id="test">${map(mediaDevices(), (mediaDeviceInfos) =>
                    mediaDeviceInfos.map(({ kind }) => kind).join(',')
                )}</div>`;

                setTimeout(() => document.body.appendChild(test));
                finalizationRegistry.register(test);

                while (true) {
                    try {
                        expect(document.getElementById('test').textContent).to.match(
                            /(?:audioinput|audiooutput|videoinput)(?:,(?:audioinput|audiooutput|videoinput))*/
                        );

                        break;
                    } catch {
                        await new Promise((resolve) => {
                            setTimeout(resolve, 100);
                        });
                    }
                }

                document.body.removeChild(test);
            });
        });
    }
});
