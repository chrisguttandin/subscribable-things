import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { metrics } from '../../src/module';
import xs from 'xstream';

describe('metrics', () => {
    beforeEach(() => setTimeout(() => performance.mark('a fake name')));

    it('should work with RxJS', (done) => {
        from(metrics({ type: 'mark' }))
            .pipe(first())
            .subscribe((entries) => {
                expect(entries.length).to.equal(1);

                const [entry] = entries;

                expect(entry).to.be.an.instanceof(PerformanceEntry);
                expect(entry.entryType).to.equal('mark');
                expect(entry.name).to.equal('a fake name');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(metrics({ type: 'mark' }))
            .take(1)
            .subscribe({
                next(entries) {
                    expect(entries.length).to.equal(1);

                    const [entry] = entries;

                    expect(entry).to.be.an.instanceof(PerformanceEntry);
                    expect(entry.entryType).to.equal('mark');
                    expect(entry.name).to.equal('a fake name');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(metrics({ type: 'mark' })),
            take(1),
            forEach((entries) => {
                expect(entries.length).to.equal(1);

                const [entry] = entries;

                expect(entry).to.be.an.instanceof(PerformanceEntry);
                expect(entry.entryType).to.equal('mark');
                expect(entry.name).to.equal('a fake name');

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(metrics({ type: 'mark' }))
            .first()
            .onValue((entries) => {
                expect(entries.length).to.equal(1);

                const [entry] = entries;

                expect(entry).to.be.an.instanceof(PerformanceEntry);
                expect(entry.entryType).to.equal('mark');
                expect(entry.name).to.equal('a fake name');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(metrics({ type: 'mark' }))
            .take(1)
            .onValue((entries) => {
                expect(entries.length).to.equal(1);

                const [entry] = entries;

                expect(entry).to.be.an.instanceof(PerformanceEntry);
                expect(entry.entryType).to.equal('mark');
                expect(entry.name).to.equal('a fake name');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(metrics({ type: 'mark' }));

        // eslint-disable-next-line no-unreachable-loop
        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);

            const [entry] = entries;

            expect(entry).to.be.an.instanceof(PerformanceEntry);
            expect(entry.entryType).to.equal('mark');
            expect(entry.name).to.equal('a fake name');

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
            const test = h`<div id="test">${map(metrics({ type: 'mark' }), (entries) => entries.map(({ name }) => name).join(','))}</div>`;

            setTimeout(() => document.body.appendChild(test));
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('a fake name');

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
