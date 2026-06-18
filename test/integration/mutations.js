import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
// eslint-disable-next-line sort-imports
import { first, from } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { mutations } from '../../src/module';
import xs from 'xstream';

describe('mutations', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', () => {
        const { promise, resolve } = Promise.withResolvers();

        from(mutations(document.body, { childList: true }))
            .pipe(first())
            .subscribe((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                resolve();
            });

        return promise;
    });

    it('should work with XStream', () => {
        const { promise, resolve } = Promise.withResolvers();

        xs.fromObservable(mutations(document.body, { childList: true }))
            .take(1)
            .subscribe({
                next(records) {
                    expect(records.length).to.equal(1);
                    expect(records[0]).to.be.an.instanceof(MutationRecord);

                    resolve();
                }
            });

        return promise;
    });

    it('should work with callbags', () => {
        const { promise, resolve } = Promise.withResolvers();

        pipe(
            fromObs(mutations(document.body, { childList: true })),
            take(1),
            forEach((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                resolve();
            })
        );

        return promise;
    });

    it('should work with Bacon.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableBaconJs(mutations(document.body, { childList: true }))
            .first()
            .onValue((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                resolve();
            });

        return promise;
    });

    it('should work with Kefir.js', () => {
        const { promise, resolve } = Promise.withResolvers();

        fromESObservableKefirJs(mutations(document.body, { childList: true }))
            .take(1)
            .onValue((records) => {
                expect(records.length).to.equal(1);
                expect(records[0]).to.be.an.instanceof(MutationRecord);

                resolve();
            });

        return promise;
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(mutations(document.body, { childList: true }));

        // eslint-disable-next-line no-unreachable-loop
        for await (const records of eachValueFrom(source$)) {
            expect(records.length).to.equal(1);
            expect(records[0]).to.be.an.instanceof(MutationRecord);

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
            const test = h`<div id="test">${map(mutations(document.body, { childList: true }), (records) =>
                records.map(({ target }) => target.nodeName).join(',')
            )}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('BODY');

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
