import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { mediaQueryMatch } from '../../src/module';
import xs from 'xstream';

describe('mediaQueryMatch', () => {
    it('should work with RxJS', (done) => {
        from(mediaQueryMatch('(max-width:600px)'))
            .pipe(first())
            .subscribe((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(mediaQueryMatch('(max-width:600px)'))
            .take(1)
            .subscribe({
                next(isMatching) {
                    expect(isMatching).to.be.a('boolean');

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(mediaQueryMatch('(max-width:600px)')),
            take(1),
            forEach((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(mediaQueryMatch('(max-width:600px)'))
            .first()
            .onValue((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(mediaQueryMatch('(max-width:600px)'))
            .take(1)
            .onValue((isMatching) => {
                expect(isMatching).to.be.a('boolean');

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(mediaQueryMatch('(max-width:600px)'));

        // eslint-disable-next-line no-unreachable-loop
        for await (const isMatching of eachValueFrom(source$)) {
            expect(isMatching).to.be.a('boolean');

            break;
        }
    });

    describe('with a finalization registry', () => {
        let finalizationRegistry;
        let whenCollected;

        afterEach(function (done) {
            this.timeout(0);

            const arrayBuffers = [];
            const interval = setInterval(() => {
                try {
                    arrayBuffers.push(
                        new ArrayBuffer(arrayBuffers.length === 0 ? 100 : arrayBuffers[arrayBuffers.length - 1].byteLength * 10)
                    );
                } catch {
                    arrayBuffers.pop();
                }
            }, 100);

            whenCollected = () => {
                clearInterval(interval);
                done();
            };
        });

        // eslint-disable-next-line no-undef
        beforeEach(() => (finalizationRegistry = new FinalizationRegistry(() => whenCollected())));

        it('should work with hyperf', async () => {
            const test = h`<div id="test">${mediaQueryMatch('(max-width:600px)')}</div>`;

            document.body.appendChild(test);
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('false');

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
