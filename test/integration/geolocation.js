import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { cdp } from 'vitest/browser';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { geolocation } from '../../src/module';
import h from 'hyperf';
import { map } from '../helpers/map';
import xs from 'xstream';

describe('geolocation', { skip: !/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) }, () => {
    if (navigator.userAgent.includes('Chrome')) {
        afterAll(() => cdp().send('Browser.resetPermissions', { origin: location.origin }));

        afterEach(() => cdp().send('Emulation.clearGeolocationOverride'));

        beforeAll(() => cdp().send('Browser.grantPermissions', { origin: location.origin, permissions: ['geolocation'] }));

        beforeEach(() => cdp().send('Emulation.setGeolocationOverride', { accuracy: 1, latitude: 50, longitude: 50 }));
    }

    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(geolocation())
            .pipe(first())
            .subscribe((position) => {
                expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                expect(position.coords.accuracy).to.equal(1);
                expect(position.coords.latitude).to.equal(50);
                expect(position.coords.longitude).to.equal(50);

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(geolocation())
            .take(1)
            .subscribe({
                next(position) {
                    expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                    expect(position.coords.accuracy).to.equal(1);
                    expect(position.coords.latitude).to.equal(50);
                    expect(position.coords.longitude).to.equal(50);

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(geolocation()),
            take(1),
            forEach((position) => {
                expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                expect(position.coords.accuracy).to.equal(1);
                expect(position.coords.latitude).to.equal(50);
                expect(position.coords.longitude).to.equal(50);

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(geolocation())
            .first()
            .onValue((position) => {
                expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                expect(position.coords.accuracy).to.equal(1);
                expect(position.coords.latitude).to.equal(50);
                expect(position.coords.longitude).to.equal(50);

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(geolocation())
            .take(1)
            .onValue((position) => {
                expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                expect(position.coords.accuracy).to.equal(1);
                expect(position.coords.latitude).to.equal(50);
                expect(position.coords.longitude).to.equal(50);

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(geolocation());

        // eslint-disable-next-line no-unreachable-loop
        for await (const position of eachValueFrom(source$)) {
            expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
            expect(position.coords.accuracy).to.equal(1);
            expect(position.coords.latitude).to.equal(50);
            expect(position.coords.longitude).to.equal(50);

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
            const test = h`<div id="test">${map(
                geolocation(),
                ({ coords: { accuracy, latitude, longitude } }) => `${accuracy}-${latitude}-${longitude}`
            )}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('1-50-50');

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
