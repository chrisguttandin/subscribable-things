import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { intersections } from '../../src/module';
import { map } from '../helpers/map';
import xs from 'xstream';

describe('intersections', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(intersections(document.body))
            .pipe(first())
            .subscribe((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(intersections(document.body))
            .take(1)
            .subscribe({
                next(entries) {
                    expect(entries.length).to.equal(1);
                    expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(intersections(document.body)),
            take(1),
            forEach((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(intersections(document.body))
            .first()
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(intersections(document.body))
            .take(1)
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(intersections(document.body));

        // eslint-disable-next-line no-unreachable-loop
        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);
            expect(entries[0]).to.be.an.instanceof(IntersectionObserverEntry);

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
            const test = h`<div id="test">${map(intersections(document.body), (entries) => entries.length)}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('1');

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
