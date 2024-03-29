import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import { geolocation } from '../../src/module';
import h from 'hyperf';
import { map } from '../helpers/map';
import xs from 'xstream';

describe('geolocation', () => {
    // eslint-disable-next-line no-undef
    if (navigator.userAgent.includes('Chrome') || (!process.env.CI && navigator.userAgent.includes('Firefox'))) {
        if (navigator.userAgent.includes('Chrome')) {
            after(() => fetch('/reset-permissions', { body: JSON.stringify({ origin: location.origin }), method: 'POST' }));

            afterEach(() => fetch('/clear-geolocation'));

            before(() =>
                fetch('/grant-permissions', {
                    body: JSON.stringify({ origin: location.origin, permissions: ['geolocation'] }),
                    headers: { 'content-type': 'application/json' },
                    method: 'POST'
                })
            );

            beforeEach(() => fetch('/emulate-geolocation'));
        }

        it('should work with RxJS', (done) => {
            from(geolocation())
                .pipe(first())
                .subscribe((position) => {
                    expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                    expect(position.coords.accuracy).to.equal(1);
                    expect(position.coords.latitude).to.equal(50);
                    expect(position.coords.longitude).to.equal(50);

                    done();
                });
        });

        it('should work with XStream', (done) => {
            xs.fromObservable(geolocation())
                .take(1)
                .subscribe({
                    next(position) {
                        expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                        expect(position.coords.accuracy).to.equal(1);
                        expect(position.coords.latitude).to.equal(50);
                        expect(position.coords.longitude).to.equal(50);

                        done();
                    }
                });
        });

        it('should work with callbags', (done) => {
            pipe(
                fromObs(geolocation()),
                take(1),
                forEach((position) => {
                    expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                    expect(position.coords.accuracy).to.equal(1);
                    expect(position.coords.latitude).to.equal(50);
                    expect(position.coords.longitude).to.equal(50);

                    done();
                })
            );
        });

        it('should work with Bacon.js', (done) => {
            fromESObservableBaconJs(geolocation())
                .first()
                .onValue((position) => {
                    expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                    expect(position.coords.accuracy).to.equal(1);
                    expect(position.coords.latitude).to.equal(50);
                    expect(position.coords.longitude).to.equal(50);

                    done();
                });
        });

        it('should work with Kefir.js', (done) => {
            fromESObservableKefirJs(geolocation())
                .take(1)
                .onValue((position) => {
                    expect(position).to.be.an.instanceof(GeolocationPosition); // eslint-disable-line no-undef
                    expect(position.coords.accuracy).to.equal(1);
                    expect(position.coords.latitude).to.equal(50);
                    expect(position.coords.longitude).to.equal(50);

                    done();
                });
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
    }
});
