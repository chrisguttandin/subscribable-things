import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { unhandledRejection } from '../../src/module';
import xs from 'xstream';

describe('unhandledRejection', () => {
    let err;

    beforeEach(() => {
        err = new Error('a fake error');

        Promise.reject(err);
    });

    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(unhandledRejection(100))
            .pipe(first())
            .subscribe((reason) => {
                expect(reason).to.equal(err);

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(unhandledRejection(100))
            .take(1)
            .subscribe({
                next(reason) {
                    expect(reason).to.equal(err);

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(unhandledRejection(100)),
            take(1),
            forEach((reason) => {
                expect(reason).to.equal(err);

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(unhandledRejection(100))
            .first()
            .onValue((reason) => {
                expect(reason).to.equal(err);

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(unhandledRejection(100))
            .take(1)
            .onValue((reason) => {
                expect(reason).to.equal(err);

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(unhandledRejection(100));

        // eslint-disable-next-line no-unreachable-loop
        for await (const reason of eachValueFrom(source$)) {
            expect(reason).to.equal(err);

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
            const test = h`<div id="test">${map(unhandledRejection(100), ({ message }) => message)}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('a fake error');

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
