import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
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

        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);

            const [entry] = entries;

            expect(entry).to.be.an.instanceof(PerformanceEntry);
            expect(entry.entryType).to.equal('mark');
            expect(entry.name).to.equal('a fake name');

            break;
        }
    });
});
