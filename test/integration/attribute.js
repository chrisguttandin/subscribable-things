import { forEach, fromObs, pipe, scan, skip, take as takeCallbag } from 'callbag-basics';
import { from, take as takeRxJS, toArray } from 'rxjs';
import { attribute } from '../../src/module';
import { eachValueFrom } from 'rxjs-for-await';
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
            const test = h`<div id="test">${attribute(htmlElement, 'name')}</div>`;

            setTimeout(() => document.body.appendChild(test));
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
