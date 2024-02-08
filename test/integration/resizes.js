import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { resizes } from '../../src/module';
import xs from 'xstream';

describe('resizes', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        htmlElement.style.display = 'block';

        setTimeout(() => document.body.append(htmlElement));
    });

    it('should work with RxJS', (done) => {
        from(resizes(htmlElement))
            .pipe(first())
            .subscribe((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(resizes(htmlElement))
            .take(1)
            .subscribe({
                next(entries) {
                    expect(entries.length).to.equal(1);
                    expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(resizes(htmlElement)),
            take(1),
            forEach((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(resizes(htmlElement))
            .first()
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(resizes(htmlElement))
            .take(1)
            .onValue((entries) => {
                expect(entries.length).to.equal(1);
                expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(resizes(htmlElement));

        // eslint-disable-next-line no-unreachable-loop
        for await (const entries of eachValueFrom(source$)) {
            expect(entries.length).to.equal(1);
            expect(entries[0]).to.be.an.instanceof(ResizeObserverEntry);

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
            const test = h`<div id="test">${map(resizes(htmlElement), (entries) =>
                entries.map(({ target }) => target.nodeName).join(',')
            )}</div>`;

            document.body.appendChild(test);
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('DIV');

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
