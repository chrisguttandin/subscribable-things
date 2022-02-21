import { first, from } from 'rxjs';
import { forEach, fromObs, pipe, take } from 'callbag-basics';
import { eachValueFrom } from 'rxjs-for-await';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import { map } from '../helpers/map';
import { on } from '../../src/module';
import xs from 'xstream';

describe('on', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('a');

        setTimeout(() => htmlElement.dispatchEvent(new MouseEvent('click')));
    });

    it('should work with RxJS', (done) => {
        from(on(htmlElement, 'click'))
            .pipe(first())
            .subscribe((event) => {
                expect(event).to.be.an.instanceof(MouseEvent);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(on(htmlElement, 'click'))
            .take(1)
            .subscribe({
                next(event) {
                    expect(event).to.be.an.instanceof(MouseEvent);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(on(htmlElement, 'click')),
            take(1),
            forEach((event) => {
                expect(event).to.be.an.instanceof(MouseEvent);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(on(htmlElement, 'click'))
            .first()
            .onValue((event) => {
                expect(event).to.be.an.instanceof(MouseEvent);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(on(htmlElement, 'click'))
            .take(1)
            .onValue((event) => {
                expect(event).to.be.an.instanceof(MouseEvent);

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(on(htmlElement, 'click'));

        // eslint-disable-next-line no-unreachable-loop
        for await (const event of eachValueFrom(source$)) {
            expect(event).to.be.an.instanceof(MouseEvent);

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
            const test = h`<div id="test">${map(on(htmlElement, 'click'), ({ target }) => target.nodeName)}</div>`;

            document.body.appendChild(test);
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('A');

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
