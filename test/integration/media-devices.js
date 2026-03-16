import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { mediaDevices } from '../../src/module';
import xs from 'xstream';

describe('mediaDevices', () => {
    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(mediaDevices())
            .pipe(first())
            .subscribe((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(mediaDevices())
            .take(1)
            .subscribe({
                next(mediaDeviceInfos) {
                    expect(mediaDeviceInfos.length).to.be.above(0);

                    for (const mediaDeviceInfo of mediaDeviceInfos) {
                        expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                    }

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(mediaDevices()),
            take(1),
            forEach((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(mediaDevices())
            .first()
            .onValue((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(mediaDevices())
            .take(1)
            .onValue((mediaDeviceInfos) => {
                expect(mediaDeviceInfos.length).to.be.above(0);

                for (const mediaDeviceInfo of mediaDeviceInfos) {
                    expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
                }

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(mediaDevices());

        // eslint-disable-next-line no-unreachable-loop
        for await (const mediaDeviceInfos of eachValueFrom(source$)) {
            expect(mediaDeviceInfos.length).to.be.above(0);

            for (const mediaDeviceInfo of mediaDeviceInfos) {
                expect(mediaDeviceInfo).to.be.an.instanceOf(MediaDeviceInfo);
            }

            break;
        }
    });

    describe('with a finalization registry', () => {
        let finalizationRegistry;
        let whenCollected;

        afterEach(() => {
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
            const { promise, resolve } = Promise.withResolvers();

            whenCollected = () => {
                clearInterval(interval);
                resolve();
            };

            return promise;
        }, 0);

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
});
