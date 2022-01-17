import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { animationFrame } from '../../src/module';
import { eachValueFrom } from 'rxjs-for-await';
import { first } from 'rxjs/operators';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import xs from 'xstream';

describe('animationFrame', () => {
    it('should work with RxJS', (done) => {
        from(animationFrame())
            .pipe(first())
            .subscribe((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(animationFrame())
            .take(1)
            .subscribe({
                next(timestamp) {
                    expect(timestamp).to.be.a('number');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(animationFrame()),
            take(1),
            forEach((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(animationFrame())
            .first()
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(animationFrame())
            .take(1)
            .onValue((timestamp) => {
                expect(timestamp).to.be.a('number');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(animationFrame());

        // eslint-disable-next-line no-unreachable-loop
        for await (const timestamp of eachValueFrom(source$)) {
            expect(timestamp).to.be.a('number');

            break;
        }
    });

    it('should work with hyperf', async () => {
        const test = h`<div id="test">${animationFrame()}</div>`;

        document.body.appendChild(test);

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

        document.body.removeChild(test);
        test[Symbol.dispose]();
    });
});
