import { forEach, fromObs, pipe, scan, skip, take as takeCallbag } from 'callbag-basics';
import { take as takeRxJS, toArray } from 'rxjs/operators';
import { attribute } from '../../src/module';
import { eachValueFrom } from 'rxjs-for-await';
import { from } from 'rxjs';
import { fromESObservable as fromESObservableBaconJs } from 'baconjs';
import { fromESObservable as fromESObservableKefirJs } from 'kefir';
import h from 'hyperf';
import xs from 'xstream';

describe('attribute', () => {
    let htmlElement;

    afterEach(() => htmlElement.remove());

    beforeEach(() => {
        htmlElement = document.createElement('div');

        setTimeout(() => htmlElement.setAttribute('name', 'value'));
    });

    it('should work with RxJS', (done) => {
        from(attribute(htmlElement, 'name'))
            .pipe(takeRxJS(2), toArray())
            .subscribe((values) => {
                expect(values).to.deep.equal([null, 'value']);

                done();
            });
    });

    it('should work with XStream', (done) => {
        xs.fromObservable(attribute(htmlElement, 'name'))
            .take(2)
            .fold((values, value) => [...values, value], [])
            .last()
            .subscribe({
                next(values) {
                    expect(values).to.deep.equal([null, 'value']);

                    done();
                }
            });
    });

    it('should work with callbags', (done) => {
        pipe(
            fromObs(attribute(htmlElement, 'name')),
            takeCallbag(2),
            scan((values, value) => [...values, value], []),
            skip(1),
            forEach((values) => {
                expect(values).to.deep.equal([null, 'value']);

                done();
            })
        );
    });

    it('should work with Bacon.js', (done) => {
        fromESObservableBaconJs(attribute(htmlElement, 'name'))
            .take(2)
            .reduce([], (values, value) => [...values, value])
            .onValue((values) => {
                expect(values).to.deep.equal([null, 'value']);

                done();
            });
    });

    it('should work with Kefir.js', (done) => {
        fromESObservableKefirJs(attribute(htmlElement, 'name'))
            .take(2)
            .scan((values, value) => [...values, value], [])
            .last()
            .onValue((values) => {
                expect(values).to.deep.equal([null, 'value']);

                done();
            });
    });

    it('should work with rxjs-for-await', async () => {
        const source$ = from(attribute(htmlElement, 'name'));
        const values = [];

        for await (const value of eachValueFrom(source$)) {
            values.push(value);

            if (values.length === 2) {
                expect(values).to.deep.equal([null, 'value']);

                break;
            }
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
            const test = h`<div id="test">${attribute(htmlElement, 'name')}</div>`;

            document.body.appendChild(test);
            finalizationRegistry.register(test);

            while (true) {
                try {
                    expect(document.getElementById('test').textContent).to.equal('value');

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
