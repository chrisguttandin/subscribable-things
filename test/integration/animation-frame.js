import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { animationFrame } from '../../src/module';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import xs from 'xstream';

describe('animationFrame', () => {
    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(animationFrame())
            .pipe(first())
            .subscribe((timestamp) => {
                expect(timestamp).to.be.a('number');

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(animationFrame())
            .take(1)
            .subscribe({
                next(timestamp) {
                    expect(timestamp).to.be.a('number');

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(animationFrame()),
            take(1),
            forEach((timestamp) => {
                expect(timestamp).to.be.a('number');

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(animationFrame())
            .first()
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(animationFrame())
            .take(1)
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(animationFrame());

        // eslint-disable-next-line no-unreachable-loop
        for await (const timestamp of eachValueFrom(source$)) {
            expect(timestamp).to.be.a('number');

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
                    if (byteLength > 1) {
                        byteLength /= 10;
                    }
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
            const test = h`<div id="test">${animationFrame()}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.match(/[1-9]\d+/);

                    break;
                } catch {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 100);
                    });
                }
            }

            test.remove();
        });
    });
});
